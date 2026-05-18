namespace BaseCore.Entities
{
    public class Voucher
    {
        public int Id { get; set; }

        public string Code { get; set; } = "";

        public string Name { get; set; } = "";

        public string DiscountType { get; set; } = ""; // Percent hoặc Fixed

        public decimal DiscountValue { get; set; }

        public decimal? MaxDiscountAmount { get; set; }

        public decimal? MinOrderAmount { get; set; }

        public int? UsageLimit { get; set; }

        public int UsedCount { get; set; }

        public DateTime StartDate { get; set; }

        public DateTime EndDate { get; set; }

        public bool IsActive { get; set; } = true;

        public DateTime CreatedAt { get; set; } = DateTime.Now;
    }
}