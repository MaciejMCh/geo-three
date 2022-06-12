import { RenderEnviroment } from '../RenderEnviroment';

export const setupRenderLoop = (renderEnviroment: RenderEnviroment, controls, scene, camera) => {
    function animate() {
        const { webGlRenderer, deferredRenderer } = renderEnviroment;
        requestAnimationFrame(animate);
        controls.update();
        
        const rootRenderTarget = webGlRenderer.getRenderTarget();
        deferredRenderer.render(webGlRenderer);
        webGlRenderer.setRenderTarget(rootRenderTarget);
        webGlRenderer.render(scene, camera);
    }
    animate();
};
