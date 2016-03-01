using Dna.Mvp.Data.Entities;
using Repository.Pattern.Repositories;
using Service.Pattern;
using System.Security.Claims;

namespace Dna.Mvp.Services
{
    public interface IAccessControlListItemService : IService<AccessControlListItem>
    {
        
    }

    public class AccessControlListItemService : Service<AccessControlListItem>, IAccessControlListItemService
    {
        private readonly IRepositoryAsync<AccessControlListItem> _accessControlListItemRepository;

        public AccessControlListItemService(IRepositoryAsync<AccessControlListItem> repository)
            : base(repository)
        {
            _accessControlListItemRepository = repository;
        }
    }
}