mutation {
 addUser (alias: "aaa", firstName:"fff", lastName: "lll", roleId: "1", isTrader: 1, isDeveloper: 0) {
   alias
   isTrader
   isDeveloper
 }
}


mutation {
 updateUser (
   id: "5b8d152f6f4d5b3db44ee103" ,
   alias: "luis",
   firstName:"Luis",
   lastName: "Molina",
   isDeveloper: 1,
   isTrader: 1,
   isDataAnalyst: 1,
   roleId: "2"
 ) {
   alias
 }
}

query {

 users{
   alias
   firstName
   isDeveloper
   role{
     id
     name
   }
 }
}
