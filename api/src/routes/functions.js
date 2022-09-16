const axios = require("axios");
const { Types, Pokemon } =require("../db")




const getApiPoke = async (url) => {
  try {
    const apiResults = await axios.get(`https://pokeapi.co/api/v2/pokemon`);
    const apiNext = await axios.get(apiResults.data.next);
    const allPokemons = apiResults.data.results.concat(apiNext.data.results);
    for (let p of allPokemons) {
      let url = await axios.get(p.url);
      delete p.url;
      p.id = url.data.id;
      p.img = url.data.sprites.front_default;
      p.hp = url.data.stats[0].base_stat;
      p.strength = url.data.stats[1].base_stat;
      p.defense = url.data.stats[2].base_stat;
      p.speed = url.data.stats[5].base_stat;
      p.height = url.data.height;
      p.weight = url.data.weight;
      p.types = url.data.types.map((el) => el.type.name);
    }
    return allPokemons;
  } catch (error) {
    console.log(error);
  }
};

const getInfoDB = async () => {
  try {
    let dbData = await Pokemon.findAll({
      include: {
        model: Types,
        attributes: ["name"],
        through: {
          attributes: [],
        },
      },
    });

    let poke = [];
    for (let i = 0; i < dbData.length; i++) {
      let tipos = dbData[i].types.map((tipo) => {
        return tipo.name;
      });

      let newPoke = {
        id: dbData[i].id,
        name: dbData[i].name,
        img: dbData[i].img,
        hp: dbData[i].hp,
        strength: dbData[i].strength,
        defense: dbData[i].defense,
        speed: dbData[i].speed,
        height: dbData[i].height,
        weight: dbData[i].weight,
        types: tipos,
        createdDB: true,
      };
      poke.push(newPoke);
    }

    return poke;
  } catch (error) {
    console.log(error);
  }
}

const allPoke = async () => {
  try {
    const api = await getApiPoke("https://pokeapi.co/api/v2/pokemon");
    const dbInfo = await getInfoDB();
    const allInfo = api.concat(dbInfo);
    return allInfo;
  } catch (error) {
    console.log(error);
  }
};

const getByName = async (name) => {
  try {
    const nameDb = await Pokemon.findOne({
      where: { name: { [Op.iLike]: `%${name}%` } },
      include: {
        model: Types,
        attributes: ["name"],
        through: { types: [] },
      },
    });
    if (nameDb) {
      return nameDb;
    }
    const namePokemon = await axios.get(
      `https://pokeapi.co/api/v2/pokemon/${name}`
    );
    if (namePokemon.data) {
      let r = namePokemon.data;
      let pokeName = {
        name: name,
        id: r.id,
        img: r.sprites.front_default,
        hp: r.stats[0].base_stat,
        strength: r.stats[1].base_stat,
        defense: r.stats[2].base_stat,
        speed: r.stats[5].base_stat,
        height: r.height,
        weight: r.weight,
        types: r.types.map((el) => el.type.name),
      };
      console.log(pokeName);
      return pokeName;
    }
  } catch (error) {
    console.log("holas" + error);
    return { msg: "No se encontro" };
  }
};

const getApiTypes = async () => {
  try {
    let tipos = await Types.findAll({ attributes: ["name"] });
    if (!tipos.length) {
      let url = `https://pokeapi.co/api/v2/type`;
      tipos = await axios.get(url);
      tipos = tipos.data.results.map((result) => ({
        name: result.name,
      }));
      await Types.bulkCreate(tipos);
    }
    return tipos;
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
    getApiPoke,
    allPoke,
    getInfoDB,
    getByName,
    getApiTypes,
}