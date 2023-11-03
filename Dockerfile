# syntax = docker/dockerfile:1

FROM node:18-alpine as base

ARG PORT=3000

ENV NODE_ENV=production
ENV APPWRITE_ENDPOINT=https://backend.dcvocabulary.com/v1
ENV APPWRITE_PROJECT=6520d631e70f5c433e7c
ENV APPWRITE_SPEECH_ANALYZER_API_KEY=15eeb1c8d392afdf4ce1c51f94c1b5012b3a6c9ef62d42deeae21f3ed7264f8feb4cd95cd4d84a2102b31d9a28f2ee6cdf15aae0bf1d985df6b3b11f2814b0d1b8ebe08411b3b33a880b6079784b1aeffb62ef68b22c38bb2ecd63cc4db8173bbdede0eed0725d9b857d8fad9b0263776bb2e98c15a99d800ba8b2019efd5bb0
ENV APPWRITE_DB=64e8cf2d23d2ed50e63d
ENV APPWRITE_VOCABULARY_COLLECTION=652718062f1c32940568
ENV APPWRITE_SPEECH_ANALYZER_BUCKET=6540081c725c8d43b67c
ENV SPEECH_ACE_ENDPOINT=https://api.speechace.co/api/scoring/text/v9/json
ENV SPEECH_ACE_KEY=wZgqVKkyiwqKqAUNDCc%2FPHOivU%2BDaiE3WNsS35SHLkh6p8LhJ4QrbXGenGbn7fVzFL7G9EpNI1UbCIAnKtZK8BpwNw8ooTS%2BjPpf%2F6iajrktrLhkuyhi9a4%2FMr3kTp7f

WORKDIR /src

# Build
FROM base as build

COPY --link package*.json ./
RUN npm install --production=false

COPY --link . .

RUN npm run build
RUN npm prune

# Run
FROM base

ENV PORT=$PORT

COPY --from=build /src/.output /src/.output

CMD [ "node", ".output/server/index.mjs" ]