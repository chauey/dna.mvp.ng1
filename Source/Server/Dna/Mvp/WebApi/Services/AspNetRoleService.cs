using Dna.Mvp.Data.Entities;
using Repository.Pattern.Repositories;
using Service.Pattern;

namespace Dna.Mvp.Services
{
    public interface IAspNetRoleService : IService<AspNetRole>
    {
    }

    public class AspNetRoleService : Service<AspNetRole>, IAspNetRoleService
    {
        private readonly IRepositoryAsync<AspNetRole> _aspNetRoleRepository;

        public AspNetRoleService(IRepositoryAsync<AspNetRole> repository)
            : base(repository)
        {
            _aspNetRoleRepository = repository;
        }
    }
}