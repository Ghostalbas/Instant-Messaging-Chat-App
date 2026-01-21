using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using ChatApp.API.Data;
using ChatApp.API.Models;

namespace ChatApp.API.Hubs;

public class ChatHub : Hub
{
    private readonly ApplicationDbContext _context;

    public ChatHub(ApplicationDbContext context)
    {
        _context = context;
    }

    public override async Task OnConnectedAsync()
    {
        await base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.ConnectionId == Context.ConnectionId);
        if (user != null)
        {
            user.IsOnline = false;
            user.ConnectionId = null;
            await _context.SaveChangesAsync();
            
            await Clients.All.SendAsync("UserDisconnected", user.Username);
        }
        
        await base.OnDisconnectedAsync(exception);
    }

    public async Task<object> Register(string username)
    {
        var existingUser = await _context.Users.FirstOrDefaultAsync(u => u.Username == username);
        
        if (existingUser != null)
        {
            existingUser.ConnectionId = Context.ConnectionId;
            existingUser.IsOnline = true;
            await _context.SaveChangesAsync();
            
            await Clients.Others.SendAsync("UserJoined", username);
            return new { Success = true, UserId = existingUser.Id, Username = existingUser.Username };
        }
        
        var newUser = new User
        {
            Username = username,
            ConnectionId = Context.ConnectionId,
            IsOnline = true
        };
        
        _context.Users.Add(newUser);
        await _context.SaveChangesAsync();
        
        await Clients.Others.SendAsync("UserJoined", username);
        
        return new { Success = true, UserId = newUser.Id, Username = newUser.Username };
    }

    public async Task SendMessage(int senderId, string content, MessageType type, int? channelId, int? receiverId)
    {
        var sender = await _context.Users.FindAsync(senderId);
        if (sender == null) return;

        var message = new Message
        {
            SenderId = senderId,
            Content = content,
            Type = type,
            ChannelId = channelId,
            ReceiverId = receiverId,
            Timestamp = DateTime.UtcNow
        };

        _context.Messages.Add(message);
        await _context.SaveChangesAsync();

        var messageDto = new
        {
            Id = message.Id,
            Content = message.Content,
            Type = message.Type,
            Timestamp = message.Timestamp,
            SenderId = sender.Id,
            SenderUsername = sender.Username,
            ChannelId = channelId,
            ReceiverId = receiverId
        };

        if (receiverId.HasValue)
        {
            // Private message
            var receiver = await _context.Users.FindAsync(receiverId.Value);
            if (receiver?.ConnectionId != null)
            {
                await Clients.Client(receiver.ConnectionId).SendAsync("ReceiveMessage", messageDto);
            }
            await Clients.Caller.SendAsync("ReceiveMessage", messageDto);
        }
        else if (channelId.HasValue)
        {
            // Channel message
            await Clients.Group($"channel_{channelId}").SendAsync("ReceiveMessage", messageDto);
        }
        else
        {
            // Broadcast to all (fallback)
            await Clients.All.SendAsync("ReceiveMessage", messageDto);
        }
    }

    public async Task JoinChannel(int userId, int channelId)
    {
        var channel = await _context.Channels.FindAsync(channelId);
        var user = await _context.Users.FindAsync(userId);
        
        if (channel == null || user == null) return;

        var existingMembership = await _context.ChannelMemberships
            .FirstOrDefaultAsync(cm => cm.UserId == userId && cm.ChannelId == channelId);

        if (existingMembership == null)
        {
            var membership = new ChannelMembership
            {
                UserId = userId,
                ChannelId = channelId
            };
            _context.ChannelMemberships.Add(membership);
            await _context.SaveChangesAsync();
        }

        await Groups.AddToGroupAsync(Context.ConnectionId, $"channel_{channelId}");
        await Clients.Group($"channel_{channelId}").SendAsync("UserJoinedChannel", user.Username, channel.Name);
    }

    public async Task LeaveChannel(int userId, int channelId)
    {
        var channel = await _context.Channels.FindAsync(channelId);
        var user = await _context.Users.FindAsync(userId);
        
        if (channel == null || user == null) return;

        await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"channel_{channelId}");
        await Clients.Group($"channel_{channelId}").SendAsync("UserLeftChannel", user.Username, channel.Name);
    }

    public async Task<IEnumerable<object>> GetOnlineUsers()
    {
        var users = await _context.Users
            .Where(u => u.IsOnline)
            .Select(u => new { u.Id, u.Username })
            .ToListAsync();
        return users;
    }

    public async Task<IEnumerable<object>> GetChannels()
    {
        var channels = await _context.Channels
            .Select(c => new { c.Id, c.Name, c.Description })
            .ToListAsync();
        return channels;
    }

    public async Task<IEnumerable<object>> GetChannelMessages(int channelId, int take = 50)
    {
        var messages = await _context.Messages
            .Where(m => m.ChannelId == channelId)
            .OrderByDescending(m => m.Timestamp)
            .Take(take)
            .Include(m => m.Sender)
            .Select(m => new
            {
                Id = m.Id,
                Content = m.Content,
                Type = m.Type,
                Timestamp = m.Timestamp,
                SenderId = m.SenderId,
                SenderUsername = m.Sender.Username,
                ChannelId = m.ChannelId
            })
            .ToListAsync();

        return messages.OrderBy(m => m.Timestamp);
    }

    public async Task<IEnumerable<object>> GetPrivateMessages(int userId, int otherUserId, int take = 50)
    {
        var messages = await _context.Messages
            .Where(m => 
                (m.SenderId == userId && m.ReceiverId == otherUserId) ||
                (m.SenderId == otherUserId && m.ReceiverId == userId))
            .OrderByDescending(m => m.Timestamp)
            .Take(take)
            .Include(m => m.Sender)
            .Select(m => new
            {
                Id = m.Id,
                Content = m.Content,
                Type = m.Type,
                Timestamp = m.Timestamp,
                SenderId = m.SenderId,
                SenderUsername = m.Sender.Username,
                ReceiverId = m.ReceiverId
            })
            .ToListAsync();

        return messages.OrderBy(m => m.Timestamp);
    }

    public async Task StartTyping(int? channelId, int? receiverId, string username)
    {
        if (receiverId.HasValue)
        {
            var receiver = await _context.Users.FindAsync(receiverId.Value);
            if (receiver?.ConnectionId != null)
            {
                await Clients.Client(receiver.ConnectionId).SendAsync("UserTyping", username);
            }
        }
        else if (channelId.HasValue)
        {
            await Clients.OthersInGroup($"channel_{channelId}").SendAsync("UserTyping", username);
        }
    }

    public async Task StopTyping(int? channelId, int? receiverId, string username)
    {
        if (receiverId.HasValue)
        {
            var receiver = await _context.Users.FindAsync(receiverId.Value);
            if (receiver?.ConnectionId != null)
            {
                await Clients.Client(receiver.ConnectionId).SendAsync("UserStoppedTyping", username);
            }
        }
        else if (channelId.HasValue)
        {
            await Clients.OthersInGroup($"channel_{channelId}").SendAsync("UserStoppedTyping", username);
        }
    }
}
