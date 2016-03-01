using Dna.Mvp.Data.Entities;
using Dna.Mvp.Notifications;
using Repository.Pattern.Repositories;
using Service.Pattern;
using System;
using System.Configuration;
using System.Linq;

namespace Dna.Mvp.Services
{
    public interface IUserService : IService<User>
    {
        void SendRequestPasswordReset(User user);
        void SendUserCreationEmail(User user);

        User GetUserRefByAspNetUser(string userName);
    }

    public class UserService : Service<User>, IUserService
    {
        private static readonly string _forgotPasswordUrl = ConfigurationManager.AppSettings["WebBaseUrl"] +
                                                            "/#/changepassword/{0}/{1}";
        private static readonly string _loginUrl = ConfigurationManager.AppSettings["WebBaseUrl"] + "/#/login/{0}";
        private static readonly string _webBaseUrl = ConfigurationManager.AppSettings["WebBaseUrl"];

        private readonly INotificationProvider _notificationProvider;
        private readonly IRepositoryAsync<User> _userRep;
        private readonly IRepositoryAsync<AspNetUser> _aspNetUserRepositoryAsync;

        public UserService(IRepositoryAsync<User> repository, IRepositoryAsync<AspNetUser> aspNetUserRepositoryAsync, INotificationProvider notificationNotificationProvider)
            : base(repository)
        {
            _userRep = repository;
            _notificationProvider = notificationNotificationProvider;
            _aspNetUserRepositoryAsync = aspNetUserRepositoryAsync;
        }
        public override void Update(User user)
        {
            base.Update(user);
        }

        public override void Insert(User user)
        {
            if (user == null)
                throw new ArgumentException("user");

            base.Insert(user);
        }

        public void SendRequestPasswordReset(User user)
        {
            if (user == null)
                throw new ArgumentException("user");

            var email = _notificationProvider.GetSystemEmailTemplate(SystemEmailTemplate.PasswordReset);
            email.Recepients.Add(user.Email);
            email.Message = email.Message.Replace("{{WEB_BASE_URL}}", _webBaseUrl);
            email.Message = email.Message.Replace("{{FULL_NAME}}", user.FirstName);
            email.Message = email.Message.Replace("{{URL}}", string.Format(_forgotPasswordUrl, user.Email, "HACK"));
            _notificationProvider.Send(email);
        }

        public void SendUserCreationEmail(User user)
        {
            if (user == null)
                throw new ArgumentException("user");

            var email = _notificationProvider.GetSystemEmailTemplate(SystemEmailTemplate.UserCreation);
            email.Recepients.Add(user.Email);
            email.Message = email.Message.Replace("{{WEB_BASE_URL}}", _webBaseUrl);
            email.Message = email.Message.Replace("{{FULL_NAME}}", user.FirstName);
            email.Message = email.Message.Replace("{{URL}}", _loginUrl);
            _notificationProvider.Send(email);
        }

        public User GetUserRefByAspNetUser(string userName)
        {
            var aspNetUsers = this._aspNetUserRepositoryAsync.Query(x => x.UserName == userName).Select();
            var user = (from au in aspNetUsers
                        join u in this._userRep.Query().Select() on au.Id equals u.Id
                        select u).FirstOrDefault();
            return user;
        }
    }
}