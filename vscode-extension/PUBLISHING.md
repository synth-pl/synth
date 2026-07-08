# Publishing Synth Language to Open VSX

Cursor and VSCodium install extensions from [Open VSX](https://open-vsx.org/). After publishing, anyone can install globally with:

```bash
cursor --install-extension synth-lang.synth-language
code --install-extension synth-lang.synth-language
```

## One-time setup (repo maintainer)

### 1. Create an Open VSX account

1. Sign in at [open-vsx.org](https://open-vsx.org/) with GitHub
2. Complete the Eclipse Contributor Agreement if prompted ([user settings](https://open-vsx.org/user-settings/namespaces))

### 2. Create the `synth-lang` namespace

Generate a personal access token at [open-vsx.org/user-settings/tokens](https://open-vsx.org/user-settings/tokens), then:

```bash
cd vscode-extension
npx ovsx create-namespace synth-lang -p YOUR_TOKEN
```

The namespace must match `"publisher": "synth-lang"` in `package.json`.

### 3. Add GitHub secret

In [synth-pl/synth settings → Secrets](https://github.com/synth-pl/synth/settings/secrets/actions):

| Secret | Value |
|--------|-------|
| `OVSX_PAT` | Open VSX personal access token |

## Publish a new version

1. Bump `"version"` in `vscode-extension/package.json`
2. Commit and push to `main`
3. Tag and push (tag must match package version):

```bash
git tag vscode-extension-v1.0.6
git push origin vscode-extension-v1.0.6
```

GitHub Actions (`.github/workflows/publish-extension.yml`) packages the extension and runs `ovsx publish`.

### Manual publish (local)

```bash
cd vscode-extension
npx @vscode/vsce package --no-dependencies
OVSX_PAT=your_token npx ovsx publish --no-dependencies
```

## Verify

- Extension page: https://open-vsx.org/extension/synth-lang/synth-language
- Install: `cursor --install-extension synth-lang.synth-language`

## VS Code Marketplace (optional)

The official [Visual Studio Marketplace](https://marketplace.visualstudio.com/) requires a separate Azure DevOps publisher and `VSCE_PAT` secret. Open VSX is sufficient for Cursor.
