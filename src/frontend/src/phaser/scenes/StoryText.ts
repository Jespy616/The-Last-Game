import Phaser from 'phaser';
import TextCrawlPipeline from '../ui/TextCrawlPipeline'; // Import the custom pipeline

export class StoryText extends Phaser.Scene {
    storyText!: string;
    textTexture!: Phaser.GameObjects.RenderTexture;

    constructor() {
        super({ key: 'StoryText' });
    }

    init(data: { storyText: string }) {
        this.storyText = data.storyText;
    }

    preload() {
        this.load.image('space-background', 'assets/space-background.webp');
    }

    create() {
        const { width, height } = this.scale;

        // Background
        this.add.image(width / 2, height / 2, 'space-background').setOrigin(0.5).setDisplaySize(width, height);

        // Create Render Texture for Text
        this.textTexture = this.add.renderTexture(0, 0, width, height);
        this.textTexture.setOrigin(0.5, 0.5); // Adjust origin to center
        this.textTexture.setPosition(width / 2, height / 2);

        // Render Text onto Texture
        const text = this.add.text(0, 0, this.storyText, {
            fontSize: '32px',
            color: '#fff',
            align: 'center',
            wordWrap: { width: width - 50 },
        }).setOrigin(0.5);

        this.textTexture.draw(text, width / 2, height + text.height); 
        text.destroy(); // Remove text since it's now on texture

        // Register the shader pipeline
        const pipelineKey = 'TextCrawlPipeline';
        this.renderer.pipelines.addPostPipeline(pipelineKey, new TextCrawlPipeline(this.game));

        // Apply the shader to the text texture
        this.textTexture.setPipeline(pipelineKey);

        // Animate the Text Crawl
        this.tweens.add({
            targets: this.textTexture,
            y: -height / 2,
            scale: 0,
            duration: 20000,
            ease: 'Linear',
            onComplete: () => {
                this.scene.stop();
            }
        });
    }
}
