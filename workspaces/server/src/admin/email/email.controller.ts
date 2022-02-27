import { Body, Controller, Get, NotFoundException, Param, Patch, Post } from '@nestjs/common';
import { EmailInput } from './dto/email.input';
import { TestEmailInput } from './dto/test-email.input';
import { EmailService } from './email.service';

@Controller('admin/email')
export class EmailController {
  constructor(private emailService: EmailService) {}

  @Get()
  find() {
    return this.emailService.find();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const message = await this.emailService.findOne(id);

    if (!message) {
      throw new NotFoundException();
    }

    return message;
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: EmailInput) {
    return this.emailService.update(id, body);
  }

  @Post('test')
  test(@Body() body: TestEmailInput) {
    return this.emailService.test(body);
  }
}