using System;
using System.Collections.Generic;
using System.Data.Entity.Validation;
using System.IO;
using System.Linq;

namespace Dna.Mvp.Data.Entities.Seeding
{
    // TODO: Implement Seeding with Generic UOW
    internal static class Seed
    {
        private static string _password = "AD4ZPJWAmGsE5FQwVfh9PxN97cYMZQ0vm0eVkGk9Y3OVvHGfvdyOttIYalAkW0eL8g=="; // "M00nlight!";

        public static void DeleteAllData(MvpDataContext context)
        {

            List<AccessControlListItem> accessControlListItems = context.AccessControlListItems.ToList();
            context.AccessControlListItems.RemoveRange(accessControlListItems);

            List<AllDataType> allDataTypes = context.AllDataTypes.ToList();
            context.AllDataTypes.RemoveRange(allDataTypes);

            List<AspNetRole> aspNetRoles = context.AspNetRoles.ToList();
            context.AspNetRoles.RemoveRange(aspNetRoles);

            List<AspNetUser> aspNetUsers = context.AspNetUsers.ToList();
            context.AspNetUsers.RemoveRange(aspNetUsers);

            List<Attachment> attachments = context.Attachments.ToList();
            context.Attachments.RemoveRange(attachments);

            List<AuditLog> auditLogs = context.AuditLogs.ToList();
            context.AuditLogs.RemoveRange(auditLogs);

            List<DomainObject> domainObjects = context.DomainObjects.ToList();
            context.DomainObjects.RemoveRange(domainObjects);

            List<ELMAH_Error> eLMAH_Error = context.ELMAH_Error.ToList();
            context.ELMAH_Error.RemoveRange(eLMAH_Error);

            List<Permission> permissions = context.Permissions.ToList();
            context.Permissions.RemoveRange(permissions);

            List<TypeOfType> typeOfTypes = context.TypeOfTypes.ToList();
            context.TypeOfTypes.RemoveRange(typeOfTypes);

            List<Validation> validations = context.Validations.ToList();
            context.Validations.RemoveRange(validations);

            context.SaveChanges();
            List<User> users = context.Users.ToList();
            foreach (User user in users)
            {
                context.Users.Remove(user);
            }

            context.SaveChanges();


            List<Customer> customers = context.Customers.ToList();
            foreach (Customer customer in customers)
            {
                //customer.Users.Clear();
                context.Customers.Remove(customer);
            }



            List<Client> clients = context.Clients.ToList();
            context.Clients.RemoveRange(clients);

            // NOTE: Add Many-Many relation ship for T4 generation via add/remove record in TableRelationships
            List<TableRelationship> tableRelationships = context.TableRelationships.ToList();
            context.TableRelationships.RemoveRange(tableRelationships);

            context.SaveChanges();
        }

        public static void AddData(MvpDataContext context)
        {
            try
            {
                // AllDataTypes
                context.AllDataTypes.AddRange(AllDataTypeList(context));
                context.SaveChanges();

                // AspNetRoles
                context.AspNetRoles.AddRange(AspNetRoleList(context));
                context.SaveChanges();

                // AspNetUsers
                context.AspNetUsers.AddRange(AspNetUserList(context));
                context.SaveChanges();

                // Customers
                context.Customers.AddRange(CustomerList(context));
                context.SaveChanges();

                // Users
                context.Users.AddRange(UserList(context));
                context.SaveChanges();



                // DomainObjects
                context.DomainObjects.AddRange(DomainObjectList());
                context.SaveChanges();

                // Permissions
                context.Permissions.AddRange(PermissionList(context));
                context.SaveChanges();

                // AccessControlListItem
                context.AccessControlListItems.AddRange(AccessControlListItemList(context));
                context.SaveChanges();

                // Validations
                context.Validations.AddRange(ValidationList(context));
                context.SaveChanges();

                // Clients
                context.Clients.AddRange(ClientList(context));
                context.SaveChanges();

                // NOTE: Add Many-Many relation ship for T4 generation via add/remove record in TableRelationships
                context.TableRelationships.AddRange(AddTableRelationship(context));
                context.SaveChanges();

                // Get, Sort then Run sql scripts
                var sqlFiles = Directory.GetFiles(Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "Migrations"), "*.sql");
                Array.Sort<string>(sqlFiles);
                foreach (var sqlFile in sqlFiles)
                {
                    Console.WriteLine("Running Script: " + sqlFile);
                    context.Database.ExecuteSqlCommand(File.ReadAllText(sqlFile));
                }
            }
            catch (DbEntityValidationException e)
            {
                //var newException = new FormattedDbEntityValidationException(e);
                //throw newException;
            }
        }

        private static List<TableRelationship> AddTableRelationship(MvpDataContext context)
        {
            List<TableRelationship> list = new List<TableRelationship>();

            // Add Many-Many relationship for Customers/Users
            //list.Add(new TableRelationship
            //{
            //    Id = Guid.NewGuid(),
            //    Table1Name = "Customers",
            //    Table2Name = "Users",
            //});

            list.Add(new TableRelationship
            {
                Id = Guid.NewGuid(),
                Table1Name = "AspNetRoles",
                Table2Name = "Users",
            });

            return list;
        }

        public static List<DomainObject> DomainObjectList()
        {
            List<DomainObject> list = new List<DomainObject>();
            List<string> domainObjectNames = new List<string>()
            {
                "AccessControlListItems",
                "AllDataTypes",
                "AspNetRoles",
                "AspNetUserClaims",
                "AspNetUserLogins",
                "AspNetUserRoles",
                "AspNetUsers",
                "Attachments",
                "AuditLogs",
                "Cards",
                "Clients",
                "CustomerGroups",
                "CustomerRoles",
                "Customers",
                "CustomerSubscriptions",
                "DomainObjects",
                "ELMAH_Error",
                "GroupAspNetRoles",
                "GroupOwners",
                "GroupRoles",
                "Groups",
                "GroupUsers",
                "Permissions",
                "Spaces",
                "SubscriptionGroups",
                "SubscriptionPlans",
                "Subscriptions",
                "TableRelationships",
                "TypeOfTypes",
                "Users",
                "Validations",
            };

            foreach (string domainObjectName in domainObjectNames)
            {
                list.Add(new DomainObject()
                    {
                        Name = domainObjectName,
                        Description = domainObjectName,
                        IsActive = true,
                        CreatedDate = DateTime.UtcNow,
                        CreatedBy = Guid.Empty.ToString()
                    });
            }

            return list;
        }

        public static List<AccessControlListItem> AccessControlListItemList(MvpDataContext context)
        {
            List<AccessControlListItem> list = new List<AccessControlListItem>();
            var adminRole = context.AspNetRoles.FirstOrDefault(x => x.Name == "Admin");
            var userRole = context.AspNetRoles.FirstOrDefault(x => x.Name == "User");

            var domainObjectForUser = new List<string>() 
            { 
                "AllDataTypes",
                "AspNetUsers",
                "Attachments",
                "AuditLogs",
                "Cards",
                "Customers",
                "CustomerSubscriptions",
                "ELMAH_Error",
                "Spaces",
                "TypeOfTypes",
                "Users",
                "Validations",
            };

            foreach (var domainObject in context.DomainObjects.ToList())
            {
                if (domainObjectForUser.Contains(domainObject.Name))
                {
                    // Map the domain objects related to user for user with full permission
                    list.Add(new AccessControlListItem()
                    {
                        DomainObjectId = domainObject.Id,
                        PermissionValue = 7,
                        RoleId = userRole.Id,
                        IsActive = true,
                        CreatedBy = Guid.Empty.ToString(),
                        CreatedDate = DateTime.UtcNow,
                    });
                }

                // Map all domain objects for admin with full permission
                list.Add(new AccessControlListItem()
                {
                    DomainObjectId = domainObject.Id,
                    PermissionValue = 7,
                    RoleId = adminRole.Id,
                    IsActive = true,
                    CreatedBy = Guid.Empty.ToString(),
                    CreatedDate = DateTime.UtcNow,
                });
            }

            return list;
        }

        public static List<Validation> ValidationList(MvpDataContext context)
        {
            List<Validation> list = new List<Validation>();
            User user = context.Users.FirstOrDefault();
            list.Add(new Validation
            {
                ValidationID = Guid.NewGuid(),
                Integer = 5,
                String = "Name String",
                Date = DateTime.UtcNow,
                BeforeDate = DateTime.UtcNow.AddDays(-1),
                AfterDate = DateTime.UtcNow.AddDays(1),
                Age = 15,
                CreditCard = 123456789,
                Email = "a123@a1234.com",
                Phone = "123456789",
                URL = "http://abc.cm",
                Zip = "78965",
                StartsWithDPT = "dnacss",
                ContainsDPT = "abcdnadef",
                UserId = user.Id
            });

            for (int i = 0; i < 25; i++)
            {
                list.Add(new Validation
                {
                    ValidationID = Guid.NewGuid(),
                    Integer = i,
                    String = "String " + i.ToString(),
                    UserId = user.Id
                });
            }



            return list;
        }

        public static List<Permission> PermissionList(MvpDataContext context)
        {
            List<Permission> list = new List<Permission>();

            list.Add(new Permission
            {
                Value = 1,
                Name = "R",
                Description = "Read",
                IsActive = true,
                CreatedDate = DateTime.UtcNow,
                CreatedBy = Guid.Empty.ToString()
            });

            list.Add(new Permission
            {
                Value = 2,
                Name = "W",
                Description = "Write",
                IsActive = true,
                CreatedDate = DateTime.UtcNow,
                CreatedBy = Guid.Empty.ToString()
            });

            list.Add(new Permission
            {
                Value = 4,
                Name = "D",
                Description = "Delete",
                IsActive = true,
                CreatedDate = DateTime.UtcNow,
                CreatedBy = Guid.Empty.ToString()
            });

            return list;
        }

        public static List<AspNetUser> AspNetUserList(MvpDataContext context)
        {
            List<AspNetUser> list = new List<AspNetUser>();
            var adminRole = context.AspNetRoles.FirstOrDefault(x => x.Name == "Admin");
            var userRole = context.AspNetRoles.FirstOrDefault(x => x.Name == "User");

            list.Add(new AspNetUser
            {
                Id = Guid.NewGuid().ToString(),
                EmailConfirmed = false,
                PasswordHash = _password, // PasswordManagment.CreateHash(_password),
                PhoneNumberConfirmed = false,
                TwoFactorEnabled = false,
                LockoutEnabled = false,
                AccessFailedCount = 0,
                UserName = "admin",
                AspNetRoles = new List<AspNetRole>() { adminRole },
            });

            list.Add(new AspNetUser
            {
                Id = Guid.NewGuid().ToString(),
                EmailConfirmed = false,
                PasswordHash = _password, //PasswordManagment.CreateHash(_password),
                PhoneNumberConfirmed = false,
                TwoFactorEnabled = false,
                LockoutEnabled = false,
                AccessFailedCount = 0,
                UserName = "user",
                AspNetRoles = new List<AspNetRole>() { userRole },
            });

            return list;
        }

        public static List<Customer> CustomerList(MvpDataContext context)
        {
            List<Customer> list = new List<Customer>();
            var customer = new Customer
            {
                FirstName = "DNA",
                LastName = "CSS",
                Id = "dna",
                StripeId = "123456",
            };
            list.Add(customer);
            return list;
        }

        public static List<User> UserList(MvpDataContext context)
        {
            List<User> list = new List<User>();
            var adminAspNetUser = context.AspNetUsers.FirstOrDefault(x => x.UserName == "admin");
            var userAspNetUser = context.AspNetUsers.FirstOrDefault(x => x.UserName == "user");
            //var customer = context.Customers.FirstOrDefault();
            //ICollection<Customer> customers = new Collection<Customer>();
            //customers.Add(customer);
            var adminUser = new User
            {
                FirstName = "Admin",
                LastName = "Admin",
                Company = "Admin Company",
                Birthday = DateTime.Now.AddYears(-30),
                Id = adminAspNetUser.Id,
                CreatedDate = DateTime.Now,
                //Customers = customers
            };
            list.Add(adminUser);

            var userUser = new User
            {
                FirstName = "User",
                LastName = "User",
                Company = "User Company",
                Birthday = DateTime.Now.AddYears(-26),
                Id = userAspNetUser.Id,
                CreatedDate = DateTime.Now,
                //Customers = customers
            };
            list.Add(userUser);

            return list;
        }

        public static List<AspNetRole> AspNetRoleList(MvpDataContext context)
        {
            List<AspNetRole> list = new List<AspNetRole>();

            list.Add(new AspNetRole { Id = "1", Name = "Admin" });
            list.Add(new AspNetRole { Id = "2", Name = "User" });
            list.Add(new AspNetRole { Id = "3", Name = "Super Admin" });
            list.Add(new AspNetRole { Id = "4", Name = "Payer" });
            list.Add(new AspNetRole { Id = "5", Name = "Customer" });

            return list;
        }

        public static List<AllDataType> AllDataTypeList(MvpDataContext context)
        {
            List<AllDataType> list = new List<AllDataType>();

            list.Add(new AllDataType
            {
                Id = Guid.NewGuid(),
                BigInt = 1,
                Bit = true,
                Char = "Test Char",
                Date = DateTime.UtcNow,
                UniqueIdentifier = Guid.NewGuid(),
            });

            return list;
        }

        public static List<Client> ClientList(MvpDataContext context)
        {
            List<Client> list = new List<Client>();

            // fb
            list.Add(new Client
            {
                Id = "834760529948191",
                Secret = "45257a38cf17f60e18ebbc2af14f30b2",
                Name = "DNALeanStartupMVP",
                ApplicationType = 0,
                Active = true,
                RefreshTokenLifeTime = 7200,
                AllowedOrigin = "http://localhost:12484,https://dnaleanstartupmvp.azurewebsites.net,http://dnaleanstartupmvp.azurewebsites.net"
            });

            // google
            list.Add(new Client
            {
                Id = "474818352230-98ng0du6l7sg1d5gqoukbs25fn95hmgp.apps.googleusercontent.com",
                Secret = "3_VTKJFQtPoExX0v1f_jWPtJ",
                Name = "DNALeanStartupMVP",
                ApplicationType = 0,
                Active = true,
                RefreshTokenLifeTime = 7200,
                AllowedOrigin = "http://localhost:12484,https://dnaleanstartupmvp.azurewebsites.net,http://dnaleanstartupmvp.azurewebsites.net"
            });

            return list;
        }
    }
}