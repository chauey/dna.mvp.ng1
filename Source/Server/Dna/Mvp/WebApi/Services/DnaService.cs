using Repository.Pattern.Infrastructure;
using Repository.Pattern.Repositories;
using Service.Pattern;
using SimpleInjector;

namespace Dna.Mvp.Services
{
    public interface IDnaService<T> : IService<T> where T : IObjectState
    {
    }

    public class DnaService<T> : Service<T>, IDnaService<T> where T : class, IObjectState
    {
        private readonly Container _container;
        private readonly IRepositoryAsync<T> _repository;

        public DnaService(IRepositoryAsync<T> repository, Container container)
            : base(repository)
        {
            _repository = repository;
        }
    }
}