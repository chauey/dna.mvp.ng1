using Repository.Pattern.Ef6;

namespace Dna.Mvp.Data.Entities
{
    using System;
    using System.Data.Entity;
    using System.ComponentModel.DataAnnotations.Schema;
    using System.Linq;
    using System.Data.Entity.ModelConfiguration.Conventions;

    public partial class MvpDataContext : DbContext
    {
        public MvpDataContext()
            : base(@"data source=.\MSSQLSERVER14;initial catalog=Mvp;integrated security=True;multipleactiveresultsets=True;application name=EntityFramework")
        {
            Database.SetInitializer(new CreateDatabaseIfNotExists<MvpContext>());
            Database.Initialize(false);
        }

        public virtual DbSet<AllDataType> AllDataTypes { get; set; }
        public virtual DbSet<AspNetRole> AspNetRoles { get; set; }
        public virtual DbSet<AspNetUserClaim> AspNetUserClaims { get; set; }
        public virtual DbSet<AspNetUserLogin> AspNetUserLogins { get; set; }
        public virtual DbSet<AspNetUser> AspNetUsers { get; set; }
        public virtual DbSet<Attachment> Attachments { get; set; }
        public virtual DbSet<AuditLog> AuditLogs { get; set; }
        public virtual DbSet<Client> Clients { get; set; }
        public virtual DbSet<ELMAH_Error> ELMAH_Error { get; set; }
        public virtual DbSet<TypeOfType> TypeOfTypes { get; set; }
        public virtual DbSet<User> Users { get; set; }
        public virtual DbSet<Validation> Validations { get; set; }
        public virtual DbSet<AccessControlListItem> AccessControlListItems { get; set; }
        public virtual DbSet<DomainObject> DomainObjects { get; set; }
        public virtual DbSet<Permission> Permissions { get; set; }
        public virtual DbSet<TableRelationship> TableRelationships { get; set; }
        public virtual DbSet<Space> Spaces { get; set; }

        #region Stripe
        public virtual DbSet<Card> Cards { get; set; }
        public virtual DbSet<Customer> Customers { get; set; }
        public virtual DbSet<Group> Groups { get; set; }
        #endregion

        public static MvpContext Create()
        {
            return new MvpContext();
        }

        protected override void OnModelCreating(DbModelBuilder modelBuilder)
        {
            // Use singular table names
            //modelBuilder.Conventions.Remove<PluralizingTableNameConvention>();

            // Disable proxy creation and lazy loading; not wanted in this service context.
            Configuration.ProxyCreationEnabled = false;
            Configuration.LazyLoadingEnabled = false;

            #region Id
            modelBuilder.Entity<AccessControlListItem>()
                .Property(c => c.Id)
                .HasDatabaseGeneratedOption(DatabaseGeneratedOption.Identity);

            modelBuilder.Entity<AuditLog>()
                .Property(c => c.Id)
                .HasDatabaseGeneratedOption(DatabaseGeneratedOption.Identity);

            modelBuilder.Entity<DomainObject>()
                .Property(c => c.Id)
                .HasDatabaseGeneratedOption(DatabaseGeneratedOption.Identity);

            modelBuilder.Entity<ELMAH_Error>()
                .Property(c => c.Sequence)
                .HasDatabaseGeneratedOption(DatabaseGeneratedOption.Identity);

            modelBuilder.Entity<Permission>()
                .Property(c => c.Id)
                .HasDatabaseGeneratedOption(DatabaseGeneratedOption.Identity);

            modelBuilder.Entity<User>()
                .Property(c => c.IUserID)
                .HasDatabaseGeneratedOption(DatabaseGeneratedOption.Identity);

            modelBuilder.Entity<TableRelationship>()
               .Property(c => c.Id)
               .HasDatabaseGeneratedOption(DatabaseGeneratedOption.Identity);
            #endregion

            modelBuilder.Entity<AllDataType>()
                .Property(e => e.Binary)
                .IsFixedLength();

            modelBuilder.Entity<AllDataType>()
                .Property(e => e.Char)
                .IsFixedLength()
                .IsUnicode(false);

            modelBuilder.Entity<AllDataType>()
                .Property(e => e.Decimal)
                .HasPrecision(18, 0);

            modelBuilder.Entity<AllDataType>()
                .Property(e => e.Money)
                .HasPrecision(19, 4);

            modelBuilder.Entity<AllDataType>()
                .Property(e => e.NChar)
                .IsFixedLength();

            modelBuilder.Entity<AllDataType>()
                .Property(e => e.Numeric)
                .HasPrecision(18, 0);

            modelBuilder.Entity<AllDataType>()
                .Property(e => e.SmallMoney)
                .HasPrecision(10, 4);

            modelBuilder.Entity<AllDataType>()
                .Property(e => e.Text)
                .IsUnicode(false);

            modelBuilder.Entity<AllDataType>()
                .Property(e => e.TimeStamp)
                .IsFixedLength();

            modelBuilder.Entity<AllDataType>()
                .Property(e => e.VarChar)
                .IsUnicode(false);

            modelBuilder.Entity<AllDataType>()
                .Property(e => e.VarCharMax)
                .IsUnicode(false);

            modelBuilder.Entity<AllDataType>()
                .Property(e => e.ZHierarchyID)
                .IsUnicode(false);

            modelBuilder.Entity<AllDataType>()
                .Property(e => e.ZSql_Variant)
                .IsUnicode(false);

            modelBuilder.Entity<AspNetRole>()
                .HasMany(e => e.AspNetUsers)
                .WithMany(e => e.AspNetRoles)
                .Map(m => m.ToTable("AspNetUserRoles").MapLeftKey("RoleId").MapRightKey("UserId"));

            modelBuilder.Entity<AspNetUser>()
                .HasMany(e => e.AspNetUserClaims)
                .WithRequired(e => e.AspNetUser)
                .HasForeignKey(e => e.UserId);

            modelBuilder.Entity<AspNetUser>()
                .HasMany(e => e.AspNetUserLogins)
                .WithRequired(e => e.AspNetUser)
                .HasForeignKey(e => e.UserId);

            modelBuilder.Entity<User>()
            .HasOptional(f => f.AspNetUser)
            .WithRequired(s => s.User);

            modelBuilder.Entity<User>()
               .HasMany(e => e.Spaces)
               .WithOptional(e => e.User)
               .HasForeignKey(e => e.PayerId);
            modelBuilder.Entity<User>()
       .HasMany(e => e.Validations)
       .WithOptional(e => e.User)
       .HasForeignKey(e => e.UserId);

            //modelBuilder.Entity<AspNetUser>()
            //    .HasOptional(e => e.Customer)
            //    .WithRequired(e => e.AspNetUser);

            modelBuilder.Entity<Attachment>()
                .Property(e => e.FileName)
                .IsUnicode(false);

            modelBuilder.Entity<Attachment>()
                .Property(e => e.FilePath)
                .IsUnicode(false);

            modelBuilder.Entity<AuditLog>()
                .Property(e => e.What)
                .IsUnicode(false);

            modelBuilder.Entity<AuditLog>()
                .Property(e => e.TableName)
                .IsUnicode(false);

            modelBuilder.Entity<AuditLog>()
                .Property(e => e.TableIdValue)
                .IsUnicode(false);

            modelBuilder.Entity<AuditLog>()
                .Property(e => e.OldData)
                .IsUnicode(false);

            modelBuilder.Entity<AuditLog>()
                .Property(e => e.NewData)
                .IsUnicode(false);

            modelBuilder.Entity<TypeOfType>()
                .HasMany(e => e.TypeOfTypes1)
                .WithOptional(e => e.TypeOfType1)
                .HasForeignKey(e => e.TypeID);

            modelBuilder.Entity<TypeOfType>()
                .HasMany(e => e.TypeOfTypes11)
                .WithOptional(e => e.TypeOfType2)
                .HasForeignKey(e => e.ParentID);

            //modelBuilder.Entity<User>()
            //    .HasMany(e => e.Users1)
            //    .WithRequired(e => e.User1)
            //    .HasForeignKey(e => e.CreateBy);

            modelBuilder.Entity<Validation>()
                .Property(e => e.CreditCard)
                .HasPrecision(16, 0);

            modelBuilder.Entity<Validation>()
                .Property(e => e.Zip)
                .IsFixedLength()
                .IsUnicode(false);

            //modelBuilder.Entity<Customer>()
            //    .HasMany<User>(s => s.Users)
            //    .WithMany(c => c.Customers)
            //    .Map(cs =>
            //    {
            //        cs.MapLeftKey("CustomerID");
            //        cs.MapRightKey("UserID");
            //        cs.ToTable("UserCustomers");
            //    });
        }
    }
}
