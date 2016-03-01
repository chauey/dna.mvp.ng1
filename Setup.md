1. Open solution file in AllSolutions\Dna.Mvp.sln
2. Right-click on the "Solution Dna.Mvp" node from the Solution Explorer and click on the "Enable NuGet Packages Restore" menu.
3. Rebuild the Solution "Dna.Mvp".
4. Change the connection strings to your local MSSQL Server (we are using SQL Server 2014)
    a. Server\Dna\Mvp\Data\Entities\App.config
    	- MvpContext connection string on constructor (Optional)
		- MvpDataContext connection string on constructor (Optional)
    b. Server\Dna\Mvp\Templates\T4\App.config (Optional)
    c. Server\Dna\Mvp\WebApi\SelfHost\App.config
5. Open View > Other Windows > Package Manager Console window, restore all nuget packages if they aren't all restored already, then select Dna.Mvp.Data.Entities as Default project
6. Run Update-Database -Verbose to create Mvp database if it doesn't exist, and seed data.
7. Set startup project:
    a. Right-click to the Dna.Mvp solution node, select Properties
    b. Select Multiple startup projects
    c. Start Dna.Mvp.WebApi.SelfHost project first, then the Client.Web project
8. F5 to run the web

Default Users:
- superadmin / M00nlight!
- admin / M00nlight!
- user / M00nlight!

9. Generate from T4
	a. Go to Templates\Dna.Mvp.Templates.T4 project
	b. Open ListView folder, right-click on ListView.tt file and select Run Custom Tool menu to generate ListView.html for all entities.
	c. Do the same for ListController.tt in ListController folder
	d. Do the same for ItemView.tt in ItemView folder
	e. Do the same for ItemController.tt in ItemController folder
	f. Do the same for EntityRepository.tt in EntityRepository folder