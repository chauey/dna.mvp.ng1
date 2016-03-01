using Dna.Mvp.Data.Entities.Core;

namespace Dna.Mvp.Data.Entities
{
    using System;
    using System.Collections.Generic;
    using System.ComponentModel.DataAnnotations;

    public partial class TypeOfType : BaseEntity
    {
        public TypeOfType()
        {
            TypeOfTypes1 = new HashSet<TypeOfType>();
            TypeOfTypes11 = new HashSet<TypeOfType>();
        }

        public Guid TypeOfTypeID { get; set; }

        public string Abbreviation { get; set; }

        [Required]
        public string Name { get; set; }

        public string Key { get; set; }

        public int? Order { get; set; }

        public Guid? ParentID { get; set; }

        public Guid? TypeID { get; set; }

        public string Value { get; set; }

        public DateTime CreatedDate { get; set; }

        public DateTime? UpdatedDate { get; set; }

        public Guid? CreateBy { get; set; }

        public Guid? UpdateBy { get; set; }

        public virtual ICollection<TypeOfType> TypeOfTypes1 { get; set; }

        public virtual TypeOfType TypeOfType1 { get; set; }

        public virtual ICollection<TypeOfType> TypeOfTypes11 { get; set; }

        public virtual TypeOfType TypeOfType2 { get; set; }
    }
}
