export function formatButton(button: Phaser.GameObjects.Text) {
    button.setInteractive({ useHandCursor: true })
        .setOrigin(0.5)
        .on('pointerover', () => button.setColor('#ff0000'))
        .on('pointerout', () => button.setColor('#ffffff'));
}