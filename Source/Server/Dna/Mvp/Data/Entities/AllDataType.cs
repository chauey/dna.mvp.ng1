using Dna.Mvp.Data.Entities.Core;

namespace Dna.Mvp.Data.Entities
{
    using System;
    using System.ComponentModel.DataAnnotations;
    using System.ComponentModel.DataAnnotations.Schema;
    using System.Data.Entity.Spatial;

    public partial class AllDataType : BaseEntity
    {
        [Key]
        ////[DatabaseGenerated(DatabaseGeneratedOption.None)]
        public Guid Id { get; set; }

        public long? BigInt { get; set; }

        [MaxLength(50)]
        public byte[] Binary { get; set; }

        public bool? Bit { get; set; }

        [StringLength(10)]
        public string Char { get; set; }

        [Column(TypeName = "date")]
        public DateTime? Date { get; set; }

        public DateTime? DateTime { get; set; }

        [Column(TypeName = "datetime2")]
        public DateTime? DateTime2 { get; set; }

        public DateTimeOffset? DateTimeOffset { get; set; }

        public decimal? Decimal { get; set; }

        public double? Float { get; set; }

        public DbGeography Geography { get; set; }

        public DbGeometry Geometry { get; set; }

        [Column(TypeName = "image")]
        public byte[] Image { get; set; }

        public int? Int { get; set; }

        [Column(TypeName = "money")]
        public decimal? Money { get; set; }

        [StringLength(10)]
        public string NChar { get; set; }

        [Column(TypeName = "ntext")]
        public string NText { get; set; }

        [Column(TypeName = "numeric")]
        public decimal? Numeric { get; set; }

        [StringLength(50)]
        public string NVarChar { get; set; }

        public string NVarCharMax { get; set; }

        public float? Real { get; set; }

        [Column(TypeName = "smalldatetime")]
        public DateTime? SmallDateTime { get; set; }

        public short? SmallInt { get; set; }

        [Column(TypeName = "smallmoney")]
        public decimal? SmallMoney { get; set; }

        [Column(TypeName = "text")]
        public string Text { get; set; }

        public TimeSpan? Time { get; set; }

        [Column(TypeName = "timestamp")]
        [DatabaseGenerated(DatabaseGeneratedOption.Computed)]
        [MaxLength(8)]
        public byte[] TimeStamp { get; set; }

        public byte? TinyInt { get; set; }

        public Guid? UniqueIdentifier { get; set; }

        [MaxLength(50)]
        public byte[] VarBinary { get; set; }

        public byte[] VarBinaryMax { get; set; }

        [StringLength(50)]
        public string VarChar { get; set; }

        public string VarCharMax { get; set; }

        [Column(TypeName = "xml")]
        public string Xml { get; set; }

        [StringLength(50)]
        public string ZHierarchyID { get; set; }

        [StringLength(50)]
        public string ZSql_Variant { get; set; }
    }
}
