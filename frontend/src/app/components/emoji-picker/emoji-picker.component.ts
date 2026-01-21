import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-emoji-picker',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './emoji-picker.component.html',
    styleUrl: './emoji-picker.component.scss'
})
export class EmojiPickerComponent {
    @Output() emojiSelected = new EventEmitter<string>();

    categories = [
        {
            name: 'Smileys',
            emojis: ['😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '😊', '😇', '🥰', '😍', '🤩', '😘', '😗', '😚', '😋', '😛', '😜', '🤪', '😝', '🤑', '🤗', '🤭', '🤫', '🤔', '🤐', '🤨', '😐', '😑', '😶', '😏', '😒', '🙄', '😬', '😮‍💨', '🤥']
        },
        {
            name: 'Gestures',
            emojis: ['👋', '🤚', '🖐️', '✋', '🖖', '👌', '🤌', '🤏', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇', '☝️', '👍', '👎', '✊', '👊', '🤛', '🤜', '👏', '🙌', '👐', '🤲', '🤝', '🙏']
        },
        {
            name: 'Hearts',
            emojis: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❤️‍🔥', '❤️‍🩹', '💖', '💗', '💓', '💞', '💕', '💟', '❣️', '💌']
        },
        {
            name: 'Objects',
            emojis: ['🎉', '🎊', '🎈', '🎁', '🎀', '🏆', '🥇', '🥈', '🥉', '⚽', '🏀', '🎮', '🎯', '🎲', '🎭', '🎨', '🎬', '🎤', '🎧', '🎸']
        },
        {
            name: 'Nature',
            emojis: ['🌞', '🌝', '🌛', '🌜', '🌚', '🌕', '🌖', '🌗', '🌘', '🌑', '🌒', '🌓', '🌔', '🌙', '🌎', '🌍', '🌏', '⭐', '🌟', '✨', '☀️', '🌤️', '⛅', '🌥️', '🌦️', '🌧️', '⛈️', '🌩️', '🌨️', '❄️', '🌬️', '🌈', '🔥']
        }
    ];

    selectedCategory = 0;

    selectEmoji(emoji: string): void {
        this.emojiSelected.emit(emoji);
    }

    selectCategory(index: number): void {
        this.selectedCategory = index;
    }
}
