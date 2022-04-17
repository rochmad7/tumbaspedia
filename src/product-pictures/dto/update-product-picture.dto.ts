import { PartialType } from '@nestjs/mapped-types';
import { CreateProductPictureDto } from './create-product-picture.dto';

export class UpdateProductPictureDto extends PartialType(CreateProductPictureDto) {}
