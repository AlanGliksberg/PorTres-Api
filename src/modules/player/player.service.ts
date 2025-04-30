import { User } from "@prisma/client";
import { PlayerAnswersDTO, PlayerDTO } from "../../types/playerTypes";
import { createPlayer as createPlayerDB, getPlayerByUserId } from "../../utils/player";

export const createPlayer = async (answers: PlayerAnswersDTO, user: User) => {
  let existingPlayer = await getPlayerByUserId(user.id);
  if (existingPlayer) return existingPlayer;

  // TODO - si ya existe un player con el mismo phone que answers.phone no se va a poder crear el player
  // Hay que ver que hacer en este caso:
  //  1- pisamos los datos del player que ya existe con los nuevos cargados
  //  2- le preguntamos si se reconoce como el player que ya esta creado
  //    2.1- se reconoce -> dejamos los datos como estan o lo dejamos editar el nombre
  //    2.2- no se reconoce -> hace el formulario, se borra el player existente (se borra el telefono para no perder historial)
  //          y por último se crea el player nuevo con lo cargado en el formulario

  const player: PlayerDTO = {
    firstName: user.firstName,
    lastName: user.lastName,
    gender: answers.gender,
    phone: answers.phone
  };

  return await createPlayerDB(player, answers, user.id);
};
