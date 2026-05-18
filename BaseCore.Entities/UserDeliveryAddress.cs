// BaseCore.Entities/UserDeliveryAddress.cs
namespace BaseCore.Entities
{
    public class UserDeliveryAddress
    {
        public int Id { get; set; }

        public int UserId { get; set; }

        public string FullName { get; set; } = "";

        public string Phone { get; set; } = "";

        public string Email { get; set; } = "";

        public string Address { get; set; } = "";

        public bool IsDefault { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.Now;
    }
}