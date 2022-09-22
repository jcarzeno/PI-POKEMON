const { Router } = require("express");
const { allPoke } = require("./functions");
const { Pokemon, Types } = require("../db");
const router = Router();

router.get("/", async (req, res) => {
  const { name } = req.query;

  try {
    let infoPokemons = await allPoke();
    if (name) {
      let namePoke = infoPokemons.filter((e) =>
        e.name.toLowerCase().includes(name.toLowerCase())
      );

      namePoke.length
        ? res.status(200).send(namePoke)
        : res.status(400).send("the pokemon was not found");
    } else {
      res.status(200).send(infoPokemons);
    }
  } catch (error) {
    res.status(404).send(error);
  }
});


router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    let info = await allPoke();

    let Id = info.filter((e) => e.id == id);

    Id.length
      ? res.status(200).send(Id)
      : res.status(404).send({ error: "pokemon id not found" });
  } catch (error) {
    console.log(error);
  }
});

router.post("/", async (req, res) => {
    const {
      name,
      hp,
      attack,
      defense,
      speed,
      height,
      weight,
      imagen,
      createdInDb,
      types,
    } = req.body;
    try {
      let NewPoke = await Pokemon.create({
        name,
        hp,
        attack,
        defense,
        speed,
        height,
        weight,
        imagen,
        createdInDb,
      });
      let typesPoke = await Types.findAll({
        where: { name: types },
      });
  
      NewPoke.addTypes(typesPoke);
  
      res.status(200).send("pokemon created successfully!");
    } catch (error) {
      console.log(error);
      res.status(404).send(error);
    }
  });
  
  // {
  //   "name" : "prueba",
  //   "hp": 2,
  //   "defense": 4,
  //   "speed": 5,
  //   "height": 22,
  //   "weight": 22,
  //   "strength": 232,
  //   "types": "prueba"
  // }

  
// router.delete("/:id", async (req, res) => {
//   const { id } = req.params;

//   let infoOtal = await Pokemon.findOne({ where: { id: id } });

//   if (infoOtal) {
//     await Pokemon.destroy({ where: { id: id } });
//     res.send("SE BORRO PAUU");
//   } else {
//     res.send("NO ESTA EL POKEMON");
//   }
// });

module.exports = router;
