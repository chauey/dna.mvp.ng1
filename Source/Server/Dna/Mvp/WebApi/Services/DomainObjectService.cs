using Dna.Mvp.Data.Entities;
using Repository.Pattern.Repositories;
using Service.Pattern;

namespace Dna.Mvp.Services
{
    public  interface IDomainObjectService : IService<DomainObject>
    {
    }

    public class DomainObjectService : Service<DomainObject>, IDomainObjectService
    {
        private readonly IRepositoryAsync<DomainObject> _domainObjectRepository;

        public DomainObjectService(IRepositoryAsync<DomainObject> repository)
            : base(repository)
        {
            _domainObjectRepository = repository;
        }
    }
}