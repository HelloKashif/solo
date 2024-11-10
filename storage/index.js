import soloCfg from '../config/index.js'
import utils from '../utils/index.js'
import axios from 'axios'
import { PassThrough } from 'stream'
import mime from 'mime-types'

import { createPresignedPost } from '@aws-sdk/s3-presigned-post'
import {
  S3Client,
  PutObjectCommand,
  ListObjectsCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  HeadBucketCommand,
  CreateBucketCommand,
} from '@aws-sdk/client-s3'

const cfg = soloCfg.storage.s3

let _s3
if (!_s3) {
  _s3 = {}
  const params = {
    endpoint: cfg.endpoint,
    forcePathStyle: true,
    signatureVersion: 'v4',
    region: cfg.region,
    credentials: {
      accessKeyId: cfg.accessKeyId,
      secretAccessKey: cfg.secretAccessKey,
    },
  }
  _s3.client = new S3Client(params)

  //In dev mode we can try to create s3 bucket if it doesn't exist
  //In prod though you will have to ensure the bucket exists before hand
  if (soloCfg) {
    //Ignore success since the bucket exists
    _s3.client
      .send(new HeadBucketCommand({ Bucket: cfg.bucketName }))
      .catch(async err => {
        console.log(
          `[Storage] Unable to get bucket: ${cfg.bucketName}, trying to create it now...`,
        )
        await _s3.client.send(
          new CreateBucketCommand({ Bucket: cfg.bucketName }),
        )
      })
  }
}

_s3.put = async function (path, data, opts = {}) {
  const result = await _s3.client.send(
    new PutObjectCommand({
      Bucket: cfg.bucketName,
      Key: path,
      Body: data,
      ...opts,
    }),
  )
  return result
}

//Puts a file from a given url. We download the file in memory first
//Careful, security checks are not implemented yet.
_s3.putFromUrl = async function (path, url, minSize, maxSize, timeout = 30000) {
  if (!url) throw Error('Invalid url', url)
  //Download the file in buffer first
  const resp = await axios.get(url, { responseType: 'stream', timeout })
  const passthrough = new PassThrough()
  //TODO error checking

  const extension = utils.getExtensionFromUrl(url)
  const params = {
    Bucket: cfg.bucketName,
    Key: path,
    Body: passthrough,
    ContentType: resp.headers['content-type'] || mime.contentType(extension),
    ContentLength: resp.headers['content-length'],
  }

  //Ensure people don't upload huge files
  if (params.ContentLength < minSize || params.ContentLength > maxSize) {
    throw Error(
      `Invalid file size: ${params.ContentLength}bytes. Allowed sizes ${minSize}-${maxSize} bytes.`,
    )
  }

  const promise = _s3.client.send(new PutObjectCommand(params))
  resp.data.pipe(passthrough)
  await promise
  return {
    contentType: params.ContentType,
    contentLength: params.ContentLength,
  }
}

_s3.get = async function (path) {
  const result = await _s3.client.send(
    new GetObjectCommand({
      Bucket: cfg.bucketName,
      Key: path,
    }),
  )
  //TODO result.Body.transformToString()
  return result.Body
}

_s3.list = async function (prefix = null) {
  const result = await _s3.client.send(
    new ListObjectsCommand({
      Bucket: cfg.bucketName,
      Prefix: prefix,
    }),
  )
  return result
}

_s3.delete = async function (path) {
  const result = await _s3.client.send(
    new DeleteObjectCommand({
      Bucket: cfg.bucketName,
      Key: path,
    }),
  )
  //TODO result.Body.transformToString()
  return result.Body
}

_s3.generateUploadUrl = async function (
  path,
  contentType,
  size,
  expires = 240,
) {
  if (!path || !contentType || !size) {
    throw new Error(
      'Missing data while generating presigned url:',
      path,
      contentType,
      size,
    )
  }

  const params = {
    Bucket: cfg.bucketName,
    Key: path,
    Fields: {
      'key': path,
      'Content-Type': contentType,
    },
    Expires: expires, // seconds
    Conditions: [['content-length-range', 0, size]],
  }
  const { url, fields } = await createPresignedPost(_s3.client, params)
  return { url, fields }
}

export default _s3
