import Phaser from 'phaser';

export default class TextCrawlPipeline extends Phaser.Renderer.WebGL.Pipelines.MultiPipeline {
    constructor(game: Phaser.Game) {
        super({
            game,
            renderTarget: true,
            fragShader: `
            precision mediump float;

            uniform sampler2D uMainSampler;
            varying vec2 outTexCoord;

            void main() {
                vec2 uv = outTexCoord;

                // Apply perspective skew (larger at bottom, smaller at top)
                float perspective = (1.0 - uv.y) * 0.5 + 0.5;
                uv.x = (uv.x - 0.5) * perspective + 0.5;

                vec4 color = texture2D(uMainSampler, uv);

                gl_FragColor = color;
            }
            `
        });
    }
}
