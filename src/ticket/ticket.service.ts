import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Ticket, TicketDocument } from './schemas/ticket.schema';
import { FilterTicketDto } from './dto/filter-ticket.dto';
import { CreateTicketDto } from './dto/create-ticket.dto';

@Injectable()
export class TicketService {
  constructor(
    @InjectModel(Ticket.name)
    private readonly ticketModel: Model<TicketDocument>,
  ) {}

  async create(createTicketDto: CreateTicketDto): Promise<Ticket> {
    const { customerName, performanceTitle, performanceTime, ticketPrice } =
      createTicketDto;
    const creationDate = new Date();

    const ticket = new this.ticketModel({
      creationDate,
      customerName,
      performanceTitle,
      performanceTime,
      ticketPrice,
    });
    const row = await ticket.save();

    if (!row) {
      throw new InternalServerErrorException();
    }

    return {
      id: row._id,
      creationDate,
      customerName,
      performanceTitle,
      performanceTime,
      ticketPrice,
    };
  }

  async findAll(filterTicketDto: FilterTicketDto): Promise<Ticket[]> {
    const offset = filterTicketDto.offset || 0;
    const limit = filterTicketDto.limit || 10;

    const rows = await this.ticketModel.find().skip(offset).limit(limit).exec();

    const tickets: Ticket[] = [];
    for (const row of rows) {
      tickets.push({
        id: row._id,
        creationDate: row.creationDate,
        customerName: row.customerName,
        performanceTitle: row.performanceTitle,
        performanceTime: row.performanceTime,
        ticketPrice: row.ticketPrice,
      });
    }

    return tickets;
  }

  async findById(id: string): Promise<Ticket> {
    const row = await this.ticketModel
      .findOne({
        _id: id,
      })
      .exec();

    if (!row) {
      throw new NotFoundException();
    }

    return {
      id: row._id,
      creationDate: row.creationDate,
      customerName: row.customerName,
      performanceTitle: row.performanceTitle,
      performanceTime: row.performanceTime,
      ticketPrice: row.ticketPrice,
    };
  }

  async update(id: string, createTicketDto: CreateTicketDto): Promise<void> {
    const result = await this.ticketModel
      .updateOne({ _id: id }, createTicketDto)
      .exec();

    if (result.nModified === 0) {
      throw new NotFoundException();
    }
  }

  async delete(id: string): Promise<void> {
    const result = await this.ticketModel.deleteOne({ _id: id }).exec();

    if (result.deletedCount === 0) {
      throw new NotFoundException();
    }
  }
}
