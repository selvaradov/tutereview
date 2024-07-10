## Things I did
### Node setup
- `nvm install node` to update
- `npm init -y`, set `"type": "module"` in `package.json`


### Typescript setup
- `sudo apt install node-typescript`
- `npm install --save-dev typescript`
- `tsc --init`
- `npm install --save-dev @tsconfig/node20`
- Use the recommendations [here](https://www.typescriptlang.org/tsconfig) 
  and [here](https://github.com/tsconfig/bases?tab=readme-ov-file#node-20-tsconfigjson)
  for the `tsconfig.json` file
- Info about how to use TS with Node [here](https://nodejs.org/en/learn/getting-started/nodejs-with-typescript)
- `npm install --save-dev eslint` 
- `npm install -D @types/{package}` for all the packages being used (`-D` is alias for `--save-dev`)

### getting things to work :((
- https://dev.to/a0viedo/nodejs-typescript-and-esm-it-doesnt-have-to-be-painful-438e 
- https://gist.github.com/slavafomin/cd7a54035eff5dc1c7c2eff096b23b6b and https://stackoverflow.com/questions/71757074/unknown-file-extension-ts-error-appears-when-trying-to-run-a-ts-node-script 
- https://stackoverflow.com/questions/33535879/how-to-run-typescript-files-from-command-line
  - hmm `ts-node` seems not to work well at all - https://github.com/TypeStrong/ts-node/issues/935 
  - giving up and going to `swc`

### mongod
- after restart had to run `sudo rm /tmp/mongodb-27017.sock` and then `sudo systemctl start mongod`

## User flow
1. SSO to verify they're a university member 
2. User registers if new, giving us their year + college + course 
3. User can submit reviews for each paper they take (we'll put together a list
of available papers for each course compiled from the university website or similar),
by telling us what tutor they had for it, and then answering some closed- and open-ended questions,
potentially also uploading the tutor's syllabus
4. Review is added to database and other users can see it when they navigate to the 
page for that course / that college / that tutor (but it's not attributable to the user who submitted it).

## prompts
> say I have a node js typescript project with the following folders in my src directory: routes, services, controllers, models, config. if required, a utils folder can also be added.

## datastore emulator
- apparently have to run `gcloud auth application-default login` first
- seems not to work if you specify the port?? so leave it blank, and then in the .env of server folder, put `http://localhost:PORT`
- to reset, do `$ curl -X POST "http://localhost:PORT/reset"`
  - https://cloud.google.com/datastore/docs/emulator#reset_emulator_data
- for composite index issues, maybe use the legacy emulator? 
  - https://cloud.google.com/datastore/docs/tools; https://cloud.google.com/datastore/docs/tools/datastore-emulator
  - It has a flag for more compatibility with the other mode too
- using the legacy emulator seems to work better

## production
- to exclude gitignore from gcloud you need to do `#!include:.gitignore` in gcloudignore I think
- watch out with cookies, `app.set('trust proxy', 1)`
  - and also enforce HTTPS https://stackoverflow.com/questions/40459511/in-express-js-req-protocol-is-not-picking-up-https-for-my-secure-link-it-alwa 
- resolved version conflicts by using workspaces for `client` & `server`, then running `npm install` in the root directory