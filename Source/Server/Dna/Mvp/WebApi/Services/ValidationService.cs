using Repository.Pattern.Repositories;
using Service.Pattern;

namespace Dna.Mvp.Services
{
    public  interface IValidationService : IService<Dna.Mvp.Data.Entities.Validation>
    {
    }

    public class ValidationService : Service<Dna.Mvp.Data.Entities.Validation>, IValidationService
    {
        private readonly IRepositoryAsync<Dna.Mvp.Data.Entities.Validation> _validationRepository;

        public ValidationService(IRepositoryAsync<Dna.Mvp.Data.Entities.Validation> repository)
            : base(repository)
        {
            _validationRepository = repository;
        }
    }
}