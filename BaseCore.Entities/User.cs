using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BaseCore.Entities
{
    public class User
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [Required]
        [MaxLength(100)]
        public string Name { get; set; }

        [Required]
        [MaxLength(50)]
        public string UserName { get; set; }

        [Required]
        [MaxLength(255)]
        public string Password { get; set; }

        public byte[] Salt { get; set; }

        [MaxLength(500)]
        public string Contact { get; set; }

        [Required]
        [MaxLength(100)]
        public string Email { get; set; }

        [MaxLength(20)]
        public string Phone { get; set; }

        [MaxLength(100)]
        public string Position { get; set; }

        [MaxLength(500)]
        public string Image { get; set; }

        public bool IsActive { get; set; } = true;

        public int UserType { get; set; } = 1;

        public DateTime Created { get; set; } = DateTime.Now;
    }
}
