using System;

namespace Dna.Utilities
{
    public enum ExceptionType
    {
        Debug,
        Info,
        Warn,
        Error,
        Fatal
    }

    public static class LoggingExceptionUtility
    {
        private static log4net.ILog _log = log4net.LogManager.GetLogger("A3 Logging");

        public static void Log(ExceptionType exceptionType, Exception exception, bool isServer = true)
        {
            Log(exceptionType, exception, isServer, _log);
        }

        public static void Log(ExceptionType exceptionType, Exception exception, bool isServer, log4net.ILog log)
        {
            // UNDONE: reviewed w team, not thread safe? should look into refactoring and more research/discussion
            string whereToLog = string.Empty;
            if (isServer)
            {
                // logging from Server
                whereToLog = "Server";
            }
            else
            {
                // logging from Client
                whereToLog = "Client";
            }

            switch (exceptionType)
            {
                case ExceptionType.Debug:
                    {
                        log.Debug(whereToLog + " Debug logging", exception);
                        break;
                    }

                case ExceptionType.Info:
                    {
                        log.Info(whereToLog + " Info logging", exception);
                        break;
                    }

                case ExceptionType.Warn:
                    {
                        log.Warn(whereToLog + " Warn logging", exception);
                        break;
                    }

                case ExceptionType.Error:
                    {
                        log.Error(whereToLog + " Error logging", exception);
                        break;
                    }

                case ExceptionType.Fatal:
                    {
                        log.Fatal(whereToLog + " Fatal logging", exception);
                        break;
                    }

                default:
                    {
                        log.Error(whereToLog + " Error logging", exception);
                        break;
                    }
            }
        }
    }
}
