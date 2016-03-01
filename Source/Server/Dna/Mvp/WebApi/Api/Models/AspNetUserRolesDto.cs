using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Dna.Mvp.WebApi.Api.Models
{
    public class AspNetUserRolesDto
    {
        public string UserId { get; set; }

        public ICollection<string> RolesIds { get; set; }
    }
}
