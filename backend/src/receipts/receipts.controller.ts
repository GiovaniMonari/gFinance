import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard";
import { CreateInternalReceiptDto } from "./dto/create-internal-receipt.dto";
import { ReceiptsService } from "./receipts.service";
import { Body, Controller, Post, Req, UseGuards } from "@nestjs/common";

type AuthenticatedRequest = Request & {
  user: {
    id: string;
  };
};

@Controller('receipts')
export class ReceiptsController {
  constructor(
    private readonly receiptsService: ReceiptsService,
  ) {}

  @Post('internal')
  @UseGuards(JwtAuthGuard)
  async createInternal(
    @Req() req: AuthenticatedRequest,
    @Body() dto: CreateInternalReceiptDto,
  ) {
    return this.receiptsService.createInternal(
      req.user.id,
      dto,
    );
  }
}