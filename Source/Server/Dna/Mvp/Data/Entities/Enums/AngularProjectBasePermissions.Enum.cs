using System;

namespace Dna.Mvp.Data.Entities.Enums
{
    [Flags]
    public enum MvpPermissions
    {
        Read = 1,
        Write = 2,
        Delete = 4
    }
}
