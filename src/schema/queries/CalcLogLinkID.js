import 'dotenv/config';
import {
  GraphQLID,
  GraphQLSchema,
  GraphQLString
} from 'graphql';

import { LogLinkIDType } from '../types';

const crypto = require('crypto');


const query = {
        loglinkid: {
            type: LogLinkIDType,
            args: { seedID: { type: GraphQLID } },
            resolve(parent, args){
                // code to get data from db / other source
                const hash = crypto.createHash('sha256');
                hash.update(process.env.PRESHARED_ELK_LOG_KEY+args.seedID);

                return { value: process.env.BEGIN_URL_ELK_LOG+hash.digest('hex')+process.env.END_URL_ELK_LOG };
            }
    }
};


export default query;
