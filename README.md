## About
This contains the source code for [TuteReview](https://tutereview.org), an
anonymous platform for students to share feedback on their papers and tutors or supervisors,
helping others to make informed decisions.

## Things I did
### Node setup
- `nvm install node` to update
- `npm init -y`, set `"type": "module"` in `package.json`

### Typescript setup
- Info about how to use TS with Node [here](https://nodejs.org/en/learn/getting-started/nodejs-with-typescript)
- `sudo apt install node-typescript`
- `npm install --save-dev typescript`
- `tsc --init`
- `npm install --save-dev @tsconfig/node20`
- Use the recommendations [here](https://www.typescriptlang.org/tsconfig) 
  and [here](https://github.com/tsconfig/bases#node-20-tsconfigjson)
  for the `tsconfig.json` file
- Installed ESLint (globally) with `npm`
- `npm install -D @types/{package}` for all the packages being used, unless they're already written with TS (`-D` is alias for `--save-dev`)
- `ts-node` and `swc` didn't work at all for me, kept getting errors which I couldn't fix
  - https://dev.to/a0viedo/nodejs-typescript-and-esm-it-doesnt-have-to-be-painful-438e 
  - https://gist.github.com/slavafomin/cd7a54035eff5dc1c7c2eff096b23b6b and https://stackoverflow.com/questions/71757074/unknown-file-extension-ts-error-appears-when-trying-to-run-a-ts-node-script 
  - https://stackoverflow.com/questions/33535879/how-to-run-typescript-files-from-command-line
  - https://github.com/TypeStrong/ts-node/issues/935 
- So just used [tsx](https://tsx.is/) instead for compiling in development, which has worked great

### Database
- After restarting the system, need to run `sudo systemctl start mongod`
  - There is a way to have it automatically restart I think, but don't really want that

### Google App Engine
- to exclude all the files listed in the `gitignore` from being uploaded to Google Cloud, you need to do `#!include:.gitignore` in `.gcloudignore` I think
- if enforcing `secure: true` for cookies in production, you need to add the line `app.set('trust proxy', 1)` because of how GAE acts as a reverse proxy
- resolved version conflicts by using workspaces for `client` & `server`, then running `npm install` in the root directory