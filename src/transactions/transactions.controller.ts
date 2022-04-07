import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { Roles } from '../auth/roles/roles.decorator';
import { ConstRole } from '../constants';
import { JwtAuthGuard } from '../auth/jwt/jwt-auth.guard';
import { RolesGuard } from '../auth/roles/roles.guard';

@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post()
  @Roles(ConstRole.BUYER, ConstRole.SELLER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  create(@Body() createTransactionDto: CreateTransactionDto, @Req() req) {
    createTransactionDto.user_id = req.user.id;
    return this.transactionsService.create(createTransactionDto);
  }

  @Get()
  @Roles(ConstRole.BUYER, ConstRole.SELLER, ConstRole.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  findAll(@Req() req) {
    if (req.user.role_id === ConstRole.ADMIN) {
      return this.transactionsService.findAll();
    } else {
      return this.transactionsService.findAllByUserId(req.user.id);
    }
  }

  @Get(':id')
  @Roles(ConstRole.BUYER, ConstRole.SELLER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  findOne(@Param('id') id: string, @Req() req) {
    return this.transactionsService.findOne(+id, +req.user.id);
  }

  @Patch(':id')
  @Roles(ConstRole.BUYER, ConstRole.SELLER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  update(
    @Param('id') id: string,
    @Body() updateTransactionDto: UpdateTransactionDto,
  ) {
    return this.transactionsService.update(+id, updateTransactionDto);
  }

  @Delete(':id')
  @Roles(ConstRole.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  remove(@Param('id') id: string) {
    return this.transactionsService.remove(+id);
  }
}
