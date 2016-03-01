using Dna.Mvp.Data.Entities;
using Repository.Pattern.Repositories;
using Service.Pattern;

namespace Dna.Mvp.Services
{
    public  interface IPermissionService : IService<Permission>
    {
    }

    public class PermissionService : Service<Permission>, IPermissionService
    {
        private readonly IRepositoryAsync<Permission> _permissionRepository;

        public PermissionService(IRepositoryAsync<Permission> repository)
            : base(repository)
        {
            _permissionRepository = repository;
        }
    }
}