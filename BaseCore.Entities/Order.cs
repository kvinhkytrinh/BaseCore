using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System;
using System.Collections.Generic;
using BaseCore.Common;
using System.Text.Json.Serialization;

namespace BaseCore.Entities
{
    public class Order
    {
        public string PaymentMethod {get; set;} = "COD";

        public string PaymentStatus {get; set;} = "Unpaid";

        public DateTime? PaidAt {get; set;}

        public string? PaymentTransactionId {get; set;}

        [BsonId]
        public int Id { get; set; }

        public int UserId { get; set; }

        public DateTime OrderDate { get; set; } = DateTime.UtcNow;

        public decimal TotalAmount { get; set; }
        
        public int? VoucherId { get; set; }
        
        public string? VoucherCode { get; set; }

        public decimal SubTotalAmount { get; set; }
        
        public decimal DiscountAmount { get; set; }

        public decimal FinalAmount { get; set; }

        public Enums.OrderStatus Status { get; set; } = Enums.OrderStatus.PendingApproval;

        public string? CustomerName { get; set; }

        public string? CustomerPhone { get; set; }

        public string? CustomerEmail { get; set; }

        public string? ShippingAddress { get; set; }
        // cac truong nghiep vu giai quyet o day
        public DateTime? ApprovedAt { get; set; }
        public int? ApprovedBy { get; set; }
        public string? ApprovalNotes { get; set; } // Lý do duyệt/từ chối

        [JsonIgnore]
        public List<OrderDetail> OrderDetails { get; set; }
    }
}
