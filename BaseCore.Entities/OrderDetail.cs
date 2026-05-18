using MongoDB.Bson.Serialization.Attributes;
using System.Text.Json.Serialization;

namespace BaseCore.Entities
{
    public class OrderDetail
    {
        [BsonId]
        public int Id { get; set; }

        public int OrderId { get; set; }

        public int ProductId { get; set; }

        public int Quantity { get; set; }

        public decimal UnitPrice { get; set; }

        public string? ProductName { get; set; }

        [BsonIgnore]
        [JsonIgnore]
        public Order Order { get; set; }

        [BsonIgnore]
        [JsonIgnore]
        public Product Product { get; set; }
    }
}
