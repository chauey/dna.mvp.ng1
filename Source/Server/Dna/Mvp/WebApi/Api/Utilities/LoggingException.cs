using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace A3.Api.Utilities
{
    public enum ExceptionType
    {
        Debug,
        Info,
        Warn,
        Error,
        Fatal
    }

    public static class LoggingException
    {
        private static log4net.ILog log;

        public static void Log(ExceptionType exceptionType, Exception exception, bool isServer = true)
        {
            // UNDONE: reviewed w team, not thread safe? should look into refactoring and more research/discussion
            if (isServer)
            {
                // logging from Server
                log = log4net.LogManager.GetLogger("A3 Server Exception");
            }
            else
            {
                // logging from Client
                log = log4net.LogManager.GetLogger("A3 Client Exception");
            }

            switch (exceptionType)
            {
                case ExceptionType.Debug:
                    {
                        log.Debug("Debug logging", exception);
                        break;
                    }

                case ExceptionType.Info:
                    {
                        log.Info("Info logging", exception);
                        break;
                    }

                case ExceptionType.Warn:
                    {
                        log.Warn("Warn logging", exception);
                        break;
                    }

                case ExceptionType.Error:
                    {
                        log.Error("Error logging", exception);
                        break;
                    }

                case ExceptionType.Fatal:
                    {
                        log.Fatal("Fatal logging", exception);
                        break;
                    }

                default:
                    {
                        log.Error("Error logging", exception);
                        break;
                    }
            }
        }
    }
}
