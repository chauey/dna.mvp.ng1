using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Dna.Mvp.WebApi.Api.Models
{
    using Microsoft.AspNet.Identity.EntityFramework;

    // Properties needed to be sent once we register a user
    public class AccountBindingModel
    {
        [Required]
        [StringLength(20, ErrorMessage = "The {0} must be between {2}-20 characters long.", MinimumLength = 5)]
        [Display(Name = "User name")]
        public string UserName { get; set; }

        [Required]
        [StringLength(100, ErrorMessage = "Email address must be between 0-100 characters long.")]
        [Display(Name = "Email address")]
        public string Email { get; set; }

        [Required]
        [StringLength(100, ErrorMessage = "The {0} must be at least {2} characters long.", MinimumLength = 6)]
        [DataType(DataType.Password)]
        [Display(Name = "Password")]
        public string Password { get; set; }

        [DataType(DataType.Password)]
        [Display(Name = "Confirm password")]
        [Compare("Password", ErrorMessage = "The password and confirmation password do not match.")]
        public string ConfirmPassword { get; set; }
    }

    public class ChangePasswordBindingModel
    {
        [Required]
        [DataType(DataType.Password)]
        [Display(Name = "Current password")]
        public string OldPassword { get; set; }

        [Required]
        [StringLength(100, ErrorMessage = "The {0} must be at least {2} characters long.", MinimumLength = 6)]
        [DataType(DataType.Password)]
        [Display(Name = "New password")]
        public string NewPassword { get; set; }

        [DataType(DataType.Password)]
        [Display(Name = "Confirm new password")]
        [Compare("NewPassword", ErrorMessage = "The new password and confirmation password do not match.")]
        public string ConfirmPassword { get; set; }
    }

    public class SetPasswordBindingModel
    {
        [Required]
        [StringLength(100, ErrorMessage = "The {0} must be at least {2} characters long.", MinimumLength = 6)]
        [DataType(DataType.Password)]
        [Display(Name = "New password")]
        public string NewPassword { get; set; }

        [DataType(DataType.Password)]
        [Display(Name = "Confirm new password")]
        [Compare("NewPassword", ErrorMessage = "The new password and confirmation password do not match.")]
        public string ConfirmPassword { get; set; }
    }

    public class AddExternalLoginBindingModel
    {
        [Required]
        [Display(Name = "External access token")]
        public string ExternalAccessToken { get; set; }
    }

    public class RemoveLoginBindingModel
    {
        [Required]
        [Display(Name = "Login provider")]
        public string LoginProvider { get; set; }

        [Required]
        [Display(Name = "Provider key")]
        public string ProviderKey { get; set; }
    }

    public class ManageAccountModel
    {
        public string LocalLoginProvider { get; set; }
        public string UserName { get; set; }
        public IdentityUser Account { get; set; }

        public StripeInfos Stripe { get; set; }

        public IEnumerable<LoginProviderViewModel> Logins { get; set; }
        public IEnumerable<ExternalLoginViewModel> ExternalLoginProviders { get; set; }

        public class StripeInfos
        {
            public bool HasCreditCard { get; set; }
            public bool HasStripeRegistered { get; set; }
        }
    }

    public class LoginProviderViewModel
    {
        public string LoginProvider { get; set; }
        public string ProviderKey { get; set; }
    }

    public class ForgotPasswordBindingModel
    {
        [Required]
        [StringLength(100, ErrorMessage = "Sorry, the system could not find a user with the email.")]
        [DataType(DataType.EmailAddress)]
        [Display(Name = "Email Address")]
        public string EmailAddress { get; set; }
    }

    public class ResetPasswordBindingModel
    {
        [Required]
        [Display(Name = "User Id")]
        public string UserId { get; set; }

        [Required]
        [Display(Name = "Reset Password Token")]
        public string ResetPasswordToken { get; set; }

        [DataType(DataType.Password)]
        [Display(Name = "New password")]
        public string NewPassword { get; set; }
    }
}