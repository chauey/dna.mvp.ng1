using Dna.Mvp.Data.Entities;
using Repository.Pattern.Repositories;
using Service.Pattern;

namespace Dna.Mvp.Services
{
    public interface ITypeOfTypeService : IService<TypeOfType>
    {
    }

    public class TypeOfTypeService : Service<TypeOfType>, ITypeOfTypeService
    {
        private readonly IRepositoryAsync<TypeOfType> _repository;

        public TypeOfTypeService(IRepositoryAsync<TypeOfType> repository)
            : base(repository)
        {
            _repository = repository;
        }
    }
}