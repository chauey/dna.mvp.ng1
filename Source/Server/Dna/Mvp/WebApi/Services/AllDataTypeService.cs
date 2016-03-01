using Dna.Mvp.Data.Entities;
using Repository.Pattern.Repositories;
using Service.Pattern;

namespace Dna.Mvp.Services
{
    public interface IAllDataTypeService : IService<AllDataType>
    {
    }

    public class AllDataTypeService : Service<AllDataType>, IAllDataTypeService
    {
        private readonly IRepositoryAsync<AllDataType> _allDataTypeRepository;

        public AllDataTypeService(IRepositoryAsync<AllDataType> repository)
            : base(repository)
        {
            _allDataTypeRepository = repository;
        }
    }
}