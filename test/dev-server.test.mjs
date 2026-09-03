import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('npm run dev serves the application', async (t) => {
    const port = 5179;
    const server = spawn('npm', ['run', 'dev', '--', '--host', '127.0.0.1', '--port', String(port), '--strictPort'], {
        stdio: ['ignore', 'pipe', 'pipe']
    });
    let output = '';
    server.stdout.on('data', (chunk) => { output += chunk; });
    server.stderr.on('data', (chunk) => { output += chunk; });

    t.after(() => server.kill());

    await new Promise((resolve) => setTimeout(resolve, 1_000));
    assert.equal(server.exitCode, null, `dev server exited early:\n${output}`);

    const response = await fetch(`http://127.0.0.1:${port}`);
    assert.equal(response.status, 200);
    assert.match(await response.text(), /<div id="root"><\/div>/);

    const entry = await fetch(`http://127.0.0.1:${port}/main.jsx`);
    assert.equal(entry.status, 200);

    const appModule = await fetch(`http://127.0.0.1:${port}/PAGEXQ.jsx`);
    assert.equal(appModule.status, 200);

    const miniQModule = await fetch(`http://127.0.0.1:${port}/MiniQ.jsx`);
    assert.equal(miniQModule.status, 200);

    const styles = await fetch(`http://127.0.0.1:${port}/src/styles.css`);
    assert.equal(styles.status, 200);
    assert.match(await styles.text(), /--tw-/);

    for (const path of ['/src/components/ui/index.jsx', '/src/components/ui/ToastProvider.jsx']) {
        const response = await fetch(`http://127.0.0.1:${port}${path}`);
        assert.equal(response.status, 200, `${path} should compile through Vite`);
        assert.match(await response.text(), /export/);
    }

    for (const source of ['PAGEXQ.jsx', 'MiniQ.jsx']) {
        assert.doesNotMatch(await readFile(source, 'utf8'), /from ['"](?:antd|@ant-design\/icons)['"]/);
    }

    const manifest = await import('../package.json', { with: { type: 'json' } });
    for (const name of ['antd', '@ant-design/icons', 'antd-mobile-icons', 'antd-style']) {
        assert.equal(manifest.default.dependencies?.[name], undefined, `${name} must not be installed`);
    }

});
