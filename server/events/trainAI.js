import FastText from 'fasttext.js';
import { join } from 'node:path';

export default async function trainAI() {
    const ft = new FastText({
        train: {
            // number of concurrent threads
            thread: 8,
            // verbosity level [2]
            verbose: 4,
            // number of negatives sampled [5]
            neg: 7,
            // loss function {ns, hs, softmax} [ns]
            loss: 'ns',
            // learning rate [0.05]
            lr: 1,
            // change the rate of updates for the learning rate [100]
            lrUpdateRate: 1000,
            // max length of word ngram [1]
            wordNgrams: 5,
            // minimal number of word occurences
            minCount: 1,
            // minimal number of word occurences
            minCountLabel: 1,
            // size of word vectors [100]
            dim: 100,
            // size of the context window [5]
            ws: 5,
            //  number of epochs [5]
            epoch: 20,
            // number of buckets [2000000]
            bucket: 2000000,
            // min length of char ngram [3]
            minn: process.env.TRAIN_MINN || 3,
            // max length of char ngram [6]
            maxn: process.env.TRAIN_MAXN || 6,
            // sampling threshold [0.0001]
            t: 0.0001,
            // load pre trained word vectors from unsupervised model
            pretrainedVectors: ''
        },
        serializeTo: join(global.__dirname, global.config.fasttext.loadModel).replace('.bin', ''),
        trainFile: join(global.__dirname, global.config.fasttext.trainFile),
        bin: join(global.__dirname, global.config.fasttext.bin)
    });
    
    global.ft.unload();

    await ft.train()

    global.ft.load();

    return;
}