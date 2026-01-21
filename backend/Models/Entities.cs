namespace ChatApp.API.Models;

public enum MessageType
{
    Text = 0,
    Image = 1,
    Video = 2,
    Link = 3
}

public class User
{
    public int Id { get; set; }
    public string Username { get; set; } = string.Empty;
    public string? ConnectionId { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public bool IsOnline { get; set; }
    
    // Navigation properties
    public ICollection<Message> SentMessages { get; set; } = new List<Message>();
    public ICollection<Message> ReceivedMessages { get; set; } = new List<Message>();
    public ICollection<ChannelMembership> ChannelMemberships { get; set; } = new List<ChannelMembership>();
}

public class Message
{
    public int Id { get; set; }
    public string Content { get; set; } = string.Empty;
    public MessageType Type { get; set; } = MessageType.Text;
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    
    // Foreign keys
    public int SenderId { get; set; }
    public int? ReceiverId { get; set; } // For private messages
    public int? ChannelId { get; set; }  // For channel messages
    
    // Navigation properties
    public User Sender { get; set; } = null!;
    public User? Receiver { get; set; }
    public Channel? Channel { get; set; }
}

public class Channel
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    // Navigation properties
    public ICollection<Message> Messages { get; set; } = new List<Message>();
    public ICollection<ChannelMembership> Memberships { get; set; } = new List<ChannelMembership>();
}

public class ChannelMembership
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public int ChannelId { get; set; }
    public DateTime JoinedAt { get; set; } = DateTime.UtcNow;
    
    // Navigation properties
    public User User { get; set; } = null!;
    public Channel Channel { get; set; } = null!;
}
