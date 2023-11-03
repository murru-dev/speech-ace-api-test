import { Client, Storage, ID, InputFile } from 'node-appwrite';
import * as fs from 'fs';
import got from 'got';
import FormData from 'form-data';
import { pipeline as streamPipeline } from 'node:stream/promises';
import axios from 'axios';
import { unlink } from 'node:fs/promises';

export default defineEventHandler(async (event) => {

  let result = '';
  const config = useRuntimeConfig();
  const client = new Client();
  const storage = new Storage(client);
  const form = await readMultipartFormData(event);
  
  client
    .setEndpoint(config.public.appwriteEndpoint)
    .setProject(config.public.appwriteProject)
    .setKey(config.public.appwriteSpeechAnalyzerApiKey);

  try {

    // Save audio file in server.
    const text = Buffer.from(form![0].data).toString();
    const fileName = Buffer.from(form![1].data).toString();
    const response = await storage.createFile(config.public.appwriteSpeechAnalyzerBucket, ID.unique(), InputFile.fromBuffer(form![2].data, fileName));
    
    // Set file URL
    const audioUrl = `https://backend.dcvocabulary.com/v1/storage/buckets/${config.public.appwriteSpeechAnalyzerBucket}/files/${response.$id}/view?project=${config.public.appwriteProject}&mode=admin`;

    // Download file
    await streamPipeline(got.stream(audioUrl), fs.createWriteStream(`public/${fileName}`));
    const crs = fs.createReadStream(`public/${fileName}`);

    const fd = new FormData();
    fd.append('text', text);
    fd.append('user_audio_file', crs);
    fd.append('question_info', '\'u1/q1\'');

    const url = `${config.public.speechAceEndpoint}?key=${config.public.speechAceKey}&dialect=en-us`;

    var conf = {
      method: 'post',
      url: url,
      headers: { 
        ...fd.getHeaders()
      },
      data : fd
    };
    
    const result = await axios(conf);
    await unlink(`public/${fileName}`);

    return result.data;
  } catch (error) {
    console.log(error);
    result = 'failed!';
  }

  return {
    result: result
  };
})