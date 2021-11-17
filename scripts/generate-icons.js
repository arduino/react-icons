const Figma = require('figma-api');
const fs = require('fs');
const request = require('request-promise');
const svgr = require('@svgr/core');
const camelCase = require('camelcase');

// Env variables
const FIGMA_API_ACCESS_TOKEN = process.env.FIGMA_API_ACCESS_TOKEN;
const FIGMA_ICON_FILE_ID = process.env.FIGMA_ICON_FILE_ID;

const main = async () => {
  // Instantiate API
  const api = new Figma.Api({
    personalAccessToken: FIGMA_API_ACCESS_TOKEN,
  });

  // Fetch icons informations
  console.log('Getting info for Figma file with ID ' + FIGMA_ICON_FILE_ID);
  const file = await api.getFile(FIGMA_ICON_FILE_ID);
  const icons = await extractIconsInfo(file);
  console.log('Found ' + icons.length + ' icon components');

  const allIconNodesInChunk = [];

  for (let i = 0; i < icons.length; i++) {

    const chunk = Math.floor(i / 100);
    if (allIconNodesInChunk[chunk] === undefined) {
      allIconNodesInChunk[chunk] = [];
    }
    allIconNodesInChunk[chunk].push(icons[i].nodeID);
  }

  allIconPromises = allIconNodesInChunk.map(e => {
    return api.getImage(FIGMA_ICON_FILE_ID, { ids: e.join(','), format: 'svg' });
  })
  
  // Download icon files
  const imageResults = {images: {}};
  console.log('Fetching image URLs...');
  for await( let iconPromise of allIconPromises) {
    const res = await iconPromise;
    imageResults.images = {...imageResults.images, ...res.images};
  }


const iconFiles = await downloadIconFiles(icons, imageResults.images);
  console.log(iconFiles.length + ' icons downloaded');

  return true;
};

const extractIconsInfo = async (file) => {
  let iconsData = [];

  for (var nodeID in file.components) {
    const name = file.components[nodeID].name;
    if (name.includes('Figma')) {
      continue;
    }
    //const componentKey = file.components[nodeID].key;
    //console.log(nodeID + " : " + componentKey + " : " + name);
    iconsData.push({ name: name, nodeID: nodeID });
  }
  return iconsData;
};

const downloadIconFiles = async (iconsInfo, imageIDs) => {
  if (!fs.existsSync('./src/icons/')) {
    fs.mkdirSync('./src/icons/');
  }

  let promises = [];

  let i = 0;

  // Empty the index file
  fs.writeFileSync('./src/index.ts', ``);

  for (var imageID in imageIDs) {
    const name = normalizeFilename(iconsInfo[i].name);
    const imageURL = imageIDs[imageID];
    const path = './src/icons/' + name + '.tsx';

    console.log('Downloading ' + imageURL);
    promises.push(downloadFile(imageURL, path, name));
    ++i;
  }

  return Promise.all(promises);
};

const downloadFile = async (url, path, name) => {
  const getImageOptions = { url: url, encoding: null, resolveWithFullResponse: true };
  return request
    .get(getImageOptions)
    .then((res) => {
      res.body = replaceAllOccurrences(res.body.toString(), 'fill="black"', 'fill="currentColor"');
      return svgr.default(
        res.body,
        { icon: true, replaceAttrValues: ['black', 'currentColor'] },
        { componentName: 'Icon' + name }
      );
    })
    .then((body) => {
      body = replaceAllOccurrences(body, 'function', 'export function');
      body = replaceAllOccurrences(body, `export default Icon${name};`, '');
      fs.writeFileSync(path, body);
      console.log(path + ' downloaded ✅');
      return path;
    })
    .then(() => {
      fs.appendFileSync('./src/index.ts', `export { Icon${name} } from './icons/${name}';\n`);
    })
    .catch((err) => {
      console.log("Couldn't download " + url);
      console.log(err);
    });
};

const replaceAllOccurrences = (text, search, replace) => {
  return text.split(search).join(replace);
};

const normalizeFilename = (name) => {
  name = replaceAllOccurrences(name, '/', '_');
  name = replaceAllOccurrences(name, ' ', '_');
  name = replaceAllOccurrences(name, 'Icon', '');
  name = camelCase(name);
  name = name.charAt(0).toUpperCase() + name.slice(1);
  return name;
};

main();
