namespace BaseCore.Entities
{
    public class VoucherUsage
    {
        public int Id { get; set; }

        public int VoucherId { get; set; }

        public int UserId { get; set; }

        public int OrderId { get; set; }

        public DateTime UsedAt { get; set; } = DateTime.Now;
    }
}