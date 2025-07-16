// src/integrations/postman.ts
import newman from 'newman';
import path from 'path';

export async function runPostmanCollection(collectionPath: string, environmentPath?: string) {
  return new Promise((resolve, reject) => {
    newman.run({
      collection: require(path.resolve(collectionPath)),
      environment: environmentPath ? require(path.resolve(environmentPath)) : undefined,
      reporters: ['cli']
    }, (err, summary) => {
      if (err) return reject(err);
      resolve(summary);
    });
  });
}
