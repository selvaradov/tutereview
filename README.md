## About
This contains the source code for [TuteReview](https://tutereview.org), an
anonymous platform for students to share feedback on their papers and tutors or supervisors,
helping others to make informed decisions.

## Functionality

**Search by college, subject, paper and tutor**

<img width="530" alt="Search function" src="https://github.com/user-attachments/assets/cbc036fa-6ab4-4eed-a580-9e6757c04e3c">

**View a summary of reviews at a glance**

<img width="530" alt="Adam Smith" src="https://github.com/user-attachments/assets/4afb22a7-768b-4cb9-a7c3-06fa0fdfe2dc">

**Dig into details of each individual review**

<img width="530" alt="Adam Smith detail" src="https://github.com/user-attachments/assets/e3412b1a-82b0-433f-ba9a-f1a4220bda51">

**Easily submit your own reviews in a few clicks**

<img width="530" alt="Review submission" src="https://github.com/user-attachments/assets/067bac0d-3737-491c-abcc-e94fa83abb0f">


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
- Want to have shared code between the client and server
  - See [my example](https://github.com/selvaradov/shared-ts-code-example)
  - To use that code in the client, requires some reconfiguration of webpack
    - https://www.youtube.com/watch?app=desktop&v=RZSJ0RhdqlU
    - (maybe) https://www.youtube.com/watch?app=desktop&v=2ljXcZrCLRk
    - https://www.youtube.com/watch?app=desktop&v=zQUpNa1hZIA (looked quite good)

- When running Node.js code, to import a JSON file as a module (rather than parsing it,
  which you could just do instead),  you must specify
  [import attributes](https://nodejs.org/api/esm.html#import-attributes)
  - In order to do this, the `module` and `moduleResolution` need to be `NodeNext` under
    `tsconfig.compilerOptions`

### Database
- After restarting the system, need to run `sudo systemctl start mongod`
  - There is a way to have it automatically restart I think, but don't really want that

### Google App Engine
- to exclude all the files listed in the `gitignore` from being uploaded to Google Cloud, you need to do `#!include:.gitignore` in `.gcloudignore` I think
- if enforcing `secure: true` for cookies in production, you need to add the line `app.set('trust proxy', 1)` because of how GAE acts as a reverse proxy
- resolved version conflicts by using workspaces for `client` & `server`, then running `npm install` in the root directory
