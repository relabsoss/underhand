module Main exposing (..)

import Html
import Html.Attributes
import Html.Events


main : Program Never Model Msg
main =
  Html.program
    { init = init
    , update = update
    , subscriptions = subscriptions
    , view = view
    }


init : (Model, Cmd Msg)
init =
  (initialModel, Cmd.none)


update : Msg -> Model -> (Model, Cmd Msg)
update msg model =
  case msg of
    OnInput value ->
      ({ model | inputText = value }, Cmd.none )

    AddItem ->
      ({ model | nestedCount = model.nestedCount + 1 }, Cmd.none )

    RemoveItem ->
      case model.nestedCount > 0 of
        True ->
          ({ model | nestedCount = model.nestedCount - 1 }, Cmd.none )

        False ->
          ( model, Cmd.none )

    _ ->
      (model, Cmd.none)


view : Model -> Html.Html Msg
view model =
  Html.div []
    [ Html.p []
        [ Html.text "P Node" ]
    , Html.div []
      [ Html.p []
         [ Html.text <| "Input value is: " ++ model.inputText ]
      , Html.p []
         [ Html.input
             [ Html.Attributes.id "observer-input"
             , Html.Attributes.type_ "text"
             , Html.Attributes.value "Input"
             , Html.Events.onInput OnInput
             , Html.Attributes.value model.inputText ]
             []
         ]
      ]
    , Html.div
        []
        (
          (Html.input
            [ Html.Attributes.type_ "button"
            , Html.Attributes.value "Add item"
            , Html.Events.onClick AddItem ]
            []
          )::(Html.input
            [ Html.Attributes.type_ "button"
            , Html.Attributes.value "Remove item"
            , Html.Events.onClick RemoveItem ]
            []
          )::(List.map (\i ->
             Html.p [] [ Html.text <| "Item with index: " ++ ( toString i )]
          ) (List.range 1 model.nestedCount ))
        )
    , Html.p []
        [ Html.input
            [ Html.Attributes.id "button1"
            , Html.Attributes.type_ "button"
            , Html.Attributes.value "Button input" ]
            []
        ]
    , Html.p []
        [ Html.button
            [ Html.Attributes.id "button2" ]
            [ Html.text "Button Node" ]
        ]
    , Html.p
        [ Html.Attributes.id "observer-text" ]
        [ Html.text "Text node" ]
    ]


subscriptions : Model -> Sub Msg
subscriptions model =
  Sub.none


type alias Model =
  { inputText: String
  , nestedCount: Int
  }


type Msg
  = NoOp
  | OnInput String
  | AddItem
  | RemoveItem


initialModel : Model
initialModel =
  { inputText = ""
  , nestedCount = 0
  }