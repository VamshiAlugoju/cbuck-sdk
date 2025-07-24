import { Injectable } from '@nestjs/common';
import { StaticDocument } from './static.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class StaticService {
  constructor(
    @InjectModel('Static')
    private readonly staticModel: Model<StaticDocument>,
  ) {
    this.createStatic();
  }

  async createStatic() {
    const staticDoc = await this.staticModel.findOne().exec();
    if (staticDoc) {
      return staticDoc;
    }
    const newStaticDoc = new this.staticModel({
      apiURL: 'http://localhost:8085',
      webURL: 'http://localhost:8085',
    });
    return newStaticDoc.save();
  }

  getInfo() {
    return this.staticModel.findOne().exec();
  }
}
